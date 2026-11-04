/**
 * ask_user tool — Ask the user a question and return their answer.
 *
 * Uses Pi's built-in dialogs so it works in the interactive TUI and over RPC:
 *   - options provided  -> selection list (arrow keys / enter)
 *   - no options        -> single-line text input
 *
 * The tool result is returned to the model so the conversation can continue
 * with the user's answer. Cancelling, submitting an empty answer, and having
 * no UI available are reported distinctly so the model can react correctly.
 */

import type { AgentToolResult, ExtensionAPI, ExtensionToolContext } from "@earendil-works/pi-coding-agent";
import { Container, Text } from "@earendil-works/pi-tui";
import { Static, Type } from "typebox";

import { SelectList } from "./select_list";

const AskUserParamsSchema = Type.Object({
	question: Type.String({ description: "The question to ask the user." }),
	options: Type.Optional(
		Type.Array(Type.String(), {
			description:
				"Optional list of choices to show the user. Empty or missing means free-text input is allowed.",
		}),
	),
	multiSelect: Type.Optional(
		Type.Boolean({
			description:
				"Optional flag to allow multiple selections. Only valid if `options` is provided and the interactive terminal UI is in use.",
		}),
	),
});

type AskUserParams = Static<typeof AskUserParamsSchema>;

type AskUserStatus = "answered" | "cancelled" | "empty" | "unavailable";

interface AskUserDetails {
	question: string;
	options?: string[];
	answers?: string[];
	status: AskUserStatus;
}

function detailsFor(params: AskUserParams, status: AskUserStatus, answers?: string[]): AskUserDetails {
	return {
		question: params.question,
		...(params.options?.length ? { options: params.options } : {}),
		status,
		...(answers?.length ? { answers } : {}),
	};
}

function answered(params: AskUserParams, answers: string[]): AgentToolResult<AskUserDetails> {
	const text =
		answers.length === 1
			? `User answered: ${answers[0]}`
			: `User selected:\n${answers.map((answer) => `- ${answer}`).join("\n")}`;
	return {
		content: [{ type: "text", text }],
		details: detailsFor(params, "answered", answers),
	};
}

function cancelled(params: AskUserParams): AgentToolResult<AskUserDetails> {
	return {
		content: [{ type: "text", text: "User cancelled the question without answering." }],
		details: detailsFor(params, "cancelled"),
	};
}

function emptyAnswer(params: AskUserParams, text: string): AgentToolResult<AskUserDetails> {
	return {
		content: [{ type: "text", text }],
		details: detailsFor(params, "empty"),
	};
}

function unavailable(params: AskUserParams, reason: string): AgentToolResult<AskUserDetails> {
	return {
		content: [{ type: "text", text: `Cannot ask the user: ${reason}` }],
		details: detailsFor(params, "unavailable"),
		isError: true,
	};
}

async function executeFreeText(
	params: AskUserParams,
	ctx: ExtensionToolContext,
	signal?: AbortSignal,
): Promise<AgentToolResult<AskUserDetails>> {
	const answer = await ctx.ui.input(params.question, undefined, { signal });
	if (answer === undefined) return cancelled(params);
	const trimmed = answer.trim();
	return trimmed.length > 0
		? answered(params, [trimmed])
		: emptyAnswer(params, "User submitted an empty answer.");
}

async function executeSelect(
	params: AskUserParams,
	ctx: ExtensionToolContext,
	signal?: AbortSignal,
): Promise<AgentToolResult<AskUserDetails>> {
	if (signal?.aborted) return cancelled(params);

	const multiSelect = params.multiSelect ?? false;
	let abortHandler: (() => void) | undefined;

	try {
		const selection = await ctx.ui.custom<string[] | undefined>((tui, theme, keybindings, done) => {
			let settled = false;
			const finish = (value: string[] | undefined) => {
				if (settled) return;
				settled = true;
				if (abortHandler) signal?.removeEventListener("abort", abortHandler);
				done(value);
			};
			abortHandler = () => finish(undefined);
			signal?.addEventListener("abort", abortHandler, { once: true });

			const container = new Container();
			container.addChild(new Text(theme.fg("accent", params.question), 0, 1));

			const selectList = new SelectList(
				params.options ?? [],
				multiSelect,
				{
					selectedItem: (text) => theme.fg("accent", text),
					noMatch: (text) => theme.fg("warning", text),
					dim: (text) => theme.fg("dim", text),
				},
				keybindings,
			);
			selectList.onSelect = (items) => finish(items);
			selectList.onCancel = () => finish(undefined);
			container.addChild(selectList);

			return {
				render(width: number) {
					return container.render(width);
				},
				handleInput(data: string) {
					selectList.handleInput(data);
					tui.requestRender();
				},
				invalidate() {
					return container.invalidate();
				},
			};
		});

		if (selection === undefined) return cancelled(params);
		return selection.length > 0
			? answered(params, selection)
			: emptyAnswer(params, "User confirmed without selecting any option.");
	} finally {
		if (abortHandler) signal?.removeEventListener("abort", abortHandler);
	}
}

export default function (pi: ExtensionAPI) {
	pi.registerTool({
		name: "ask_user",
		label: "Ask User",
		description:
			"Ask the user a question and return their answer. Supports free-text input (no options), single-select, and multi-select. Reports cancelled or empty answers distinctly.",
		parameters: AskUserParamsSchema,
		executionMode: "sequential",

		async execute(
			_toolCallId: string,
			params: AskUserParams,
			signal,
			_onUpdate,
			ctx,
		): Promise<AgentToolResult<AskUserDetails>> {
			if (!ctx.hasUI) {
				return unavailable(params, "no interactive UI is available in this mode.");
			}

			if (!params.options?.length) {
				return await executeFreeText(params, ctx, signal);
			}

			if (ctx.mode !== "tui") {
				// `ctx.ui.custom()` is a no-op outside the terminal UI. RPC dialogs
				// support a single choice only, so multi-select cannot be honoured.
				if (params.multiSelect) {
					return unavailable(
						params,
						"multi-select requires the interactive terminal UI; retry without `multiSelect` for a single choice.",
					);
				}
				const choice = await ctx.ui.select(params.question, params.options, { signal });
				return choice === undefined ? cancelled(params) : answered(params, [choice]);
			}

			return await executeSelect(params, ctx, signal);
		},
	});
}
