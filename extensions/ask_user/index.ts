import type { AgentToolResult, ExtensionAPI, ExtensionToolContext } from "@earendil-works/pi-coding-agent";
import { Container, Text } from "@earendil-works/pi-tui";

import { AskUserParamsSchema, type AskUserParams, AskUserDetails } from "./types";
import { SelectList } from "./SelectList.ts"

function buildResult(text: string, details: AskUserDetails): AgentToolResult<AskUserDetails> {
    return {
        content: [
            { type: 'text', text },
        ],
        details
    }
}

async function executeFreeText(
    params: AskUserParams,
    ctx: ExtensionToolContext,
    signal: AbortSignal,
): Promise<AgentToolResult<AskUserDetails>> {
    const answer = await ctx.ui.input(params.question, undefined, { signal });
    if (answer === undefined) {
        return buildResult("User cancelled.", params)
    }
    return buildResult(`User answered: ${answer.trim()}`, params);
}

async function executeSelect(
    params: AskUserParams,
    ctx: ExtensionToolContext,
    signal: AbortSignal,
): Promise<AgentToolResult<AskUserDetails>> {
    const answer = await ctx.ui.select(params.question, params.options ?? [], { signal })
    if (answer === undefined) {
        return buildResult("User cancelled.", params)
    }
    return buildResult(`User selected: ${answer}`, params);
}

async function executeMultiSelect(
    params: AskUserParams,
    ctx: ExtensionToolContext,
    signal: AbortSignal,
): Promise<AgentToolResult<AskUserDetails>> {
    const answers = await ctx.ui.custom<string[] | undefined>((tui, theme, keybindings, done) => {

        const container = new Container();
        container.addChild(new Text(theme.fg("accent", params.question), 0, 1));

        const selectList = new SelectList(params.options ?? [],
            {
                selectedItem: (text) => theme.fg("accent", text),
                noMatch: (text) => theme.fg("warning", text),
                dim: (text) => theme.fg("dim", text),
            },
            keybindings)
        selectList.onSubmit = (selected: string[]) => { done(selected) }
        selectList.onCancel = () => { done(undefined) }
        container.addChild(selectList);

        return {
            render(width: number): string[] {
                return container.render(width);
            },
            handleInput(data: string) {
                selectList.handleInput(data);
                tui.requestRender();
            },
            invalidate() { return container.invalidate(); }
        }
    });

    if (answers === undefined) {
        return buildResult("User cancelled.", params)
    }
    return buildResult(`User selected:\n${answers.map((answer) => `- ${answer}`).join("\n")}`, params);
}

export default function (pi: ExtensionAPI) {
    pi.registerTool({
        name: "ask_user",
        label: "Ask User",
        description:
            "Ask the user a question and return their answer. Supports free-text input (no options), single-select, and multi-select. Reports cancelled or empty answers distinctly.",
        executionMode: "sequential",
        parameters: AskUserParamsSchema,

        async execute(toolCallId, params: AskUserParams, signal: AbortSignal, onUpdate, ctx: ExtensionToolContext): Promise<AgentToolResult<AskUserDetails>> {
            if (!ctx.hasUI) {
                throw new Error("The 'ask_user' tool requires an interactive UI to be available.");
            }

            if (!params.options?.length) {
                return await executeFreeText(params, ctx, signal);
            }

            if (!params?.multiSelect) {
                return await executeSelect(params, ctx, signal);
            }

            if (ctx.mode !== "tui") {
                throw new Error("The 'ask_user' tool only supports multi-select when the interactive terminal UI is in use.");
            }

            return await executeMultiSelect(params, ctx, signal);
        }
    })
}