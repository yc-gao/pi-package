/**
 * ask_user tool — Ask the user a question and return their answer.
 *
 * Uses Pi's built-in dialogs so it works in the interactive TUI and over RPC:
 *   - options provided  -> selection list (arrow keys / click)
 *   - no options        -> single-line text input
 *
 * The tool result is returned to the model so the conversation can continue
 * with the user's answer.
 */

import type { AgentToolResult, ExtensionAPI, ExtensionToolContext } from "@earendil-works/pi-coding-agent";
import { Container, Text } from "@earendil-works/pi-tui";
import { Static, Type } from "typebox";

import { SelectList } from "./select_list";

const AskUserParams = Type.Object({
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
				"Optional flag to allow multiple selections. Only valid if `options` is provided.",
		}),
	),
});

type AskUserParamsSchema = Static<typeof AskUserParams>;


interface AskUserResultSchema {
	question: string;
	options: string[];
	answers: string[] | undefined;
}

function buildReturn(params: AskUserParamsSchema, answers: string[] | undefined): AgentToolResult<AskUserResultSchema> {
	if (!answers || answers.length === 0) {
		return {
			content: [
				{
					type: "text",
					text: "No answer provided.",
				},
			],
			details: {
				question: params.question,
				options: params.options,
				answers: undefined,
			} as AskUserResultSchema,
		};
	}
	return {
		content: [
			{
				type: "text",
				text: `User answered: ${answers.join(", ")}`,
			},
		],
		details: {
			question: params.question,
			options: params.options,
			answers,
		} as AskUserResultSchema,
	};
}

async function executeFreeText(params: AskUserParamsSchema, ctx: ExtensionToolContext, signal?: AbortSignal): Promise<AgentToolResult<AskUserResultSchema>> {
	const answer = await ctx.ui.input(params.question, undefined, { signal });
	return buildReturn(params, answer ? [answer] : undefined);
}

async function executeSelect(params: AskUserParamsSchema, multiSelect: boolean, ctx: ExtensionToolContext, signal?: AbortSignal): Promise<AgentToolResult<AskUserResultSchema>> {
	const answers = await ctx.ui.custom<string[] | undefined>((tui, theme, keybindings, done) => {
		const container = new Container();
		container.addChild(new Text(theme.fg("accent", params.question), 0, 1));

		const selectList = new SelectList(params.options ?? [], multiSelect, {
			selectedItem(t) {
				return theme.fg("accent", t);
			},
			noMatch: (t) => theme.fg("warning", t)
		});
		selectList.onSelect = (items) => done(items);
		selectList.onCancel = () => done(undefined);
		container.addChild(selectList)

		return {
			render(w: number) { return container.render(w); },
			handleInput(data: string) { selectList.handleInput(data); tui.requestRender(); },
			invalidate() { return container.invalidate(); }
		};
	});
	return buildReturn(params, answers);
}

export default function (pi: ExtensionAPI) {
	pi.registerTool({
		name: "ask_user",
		label: "Ask User",
		description: "Ask the user a question and return their answer. supports free-text input(no options), single-select, and multi-select.",
		parameters: AskUserParams,
		executionMode: "sequential",

		async execute(_toolCallId: string, params: AskUserParamsSchema, signal, _onUpdate, ctx): Promise<AgentToolResult<AskUserResultSchema>> {
			if (!ctx.hasUI) {
				return {
					content: [
						{
							type: "text",
							text: "Cannot ask the user: no interactive UI is available in this mode.",
						},
					],
					details: {
						question: params.question,
						options: params.options,
						answers: undefined,
					} as AskUserResultSchema,
				};
			}

			if (params.options && params.options.length > 0) {
				return await executeSelect(params, params.multiSelect ?? false, ctx, signal);
			}
			return await executeFreeText(params, ctx, signal);
		}
	})
}
