import type { Component, Keybinding, KeybindingsManager } from "@earendil-works/pi-tui";
import { matchesKey, truncateToWidth } from "@earendil-works/pi-tui";

export interface SelectListTheme {
    selectedItem: (text: string) => string;
    noMatch: (text: string) => string;
    dim: (text: string) => string;
}

export class SelectList implements Component {
    private options: string[];
    private multiSelect: boolean;
    private theme: SelectListTheme;
    private keybindings: KeybindingsManager;

    // Tracked by index so duplicate labels stay distinct and output order follows
    // the option order rather than the order the user clicked.
    private selectedItems: Set<number> = new Set();
    private currentIndex: number = 0;

    public onSelect: (items: string[]) => void = () => { };
    public onCancel: () => void = () => { }

    constructor(options: string[], multiSelect: boolean, theme: SelectListTheme, keybindings: KeybindingsManager) {
        this.options = options;
        this.multiSelect = multiSelect;
        this.theme = theme;
        this.keybindings = keybindings;
    }

    render(width: number): string[] {
        const lines: string[] = [];
        if (this.options.length === 0) {
            lines.push(truncateToWidth(this.theme.noMatch("  (no options)"), width));
            lines.push("");
            lines.push(truncateToWidth(this.theme.dim(`  ${this.keyText("tui.select.cancel", "esc")} cancel`), width));
            return lines;
        }

        this.options.forEach((option, index) => {
            const isCurrent = index === this.currentIndex;
            const isSelected = this.multiSelect ? this.selectedItems.has(index) : isCurrent;

            let prefix = isSelected ? "• " : "◦ ";
            prefix = isCurrent || isSelected ? this.theme.selectedItem(prefix) : prefix;

            const label = isCurrent || isSelected ? this.theme.selectedItem(option) : option;
            lines.push(truncateToWidth(prefix + label, width));
        });

        lines.push("");
        lines.push(truncateToWidth(this.theme.dim(this.renderHint()), width));
        return lines;
    }

    handleInput(data: string) {
        if (this.keybindings.matches(data, "tui.select.cancel")) {
            this.onCancel();
            return;
        }
        if (this.options.length === 0) return;

        if (this.keybindings.matches(data, "tui.select.up")) {
            this.currentIndex = (this.currentIndex - 1 + this.options.length) % this.options.length;
            return;
        }
        if (this.keybindings.matches(data, "tui.select.down")) {
            this.currentIndex = (this.currentIndex + 1) % this.options.length;
            return;
        }

        if (this.multiSelect) {
            if (matchesKey(data, "space")) {
                if (this.selectedItems.has(this.currentIndex)) {
                    this.selectedItems.delete(this.currentIndex);
                } else {
                    this.selectedItems.add(this.currentIndex);
                }
                return;
            }
            if (this.keybindings.matches(data, "tui.select.confirm")) {
                this.onSelect(this.collectSelected());
                return;
            }
        } else if (this.keybindings.matches(data, "tui.select.confirm")) {
            const selectedOption = this.options[this.currentIndex];
            this.onSelect([selectedOption]);
        }
    }

    invalidate() { }

    private collectSelected(): string[] {
        return this.options.filter((_, index) => this.selectedItems.has(index));
    }

    /** Resolve a configured keybinding to its keys, falling back to a literal symbol. */
    private keyText(keybinding: Keybinding, fallback: string): string {
        const keys = this.keybindings.getKeys(keybinding);
        return keys.length > 0 ? keys.join("/") : fallback;
    }

    private renderHint(): string {
        const navigate = `${this.keyText("tui.select.up", "↑")}/${this.keyText("tui.select.down", "↓")}`;
        const confirm = this.keyText("tui.select.confirm", "enter");
        const cancel = this.keyText("tui.select.cancel", "esc");
        const hint = this.multiSelect
            ? `${navigate} navigate • space select/deselect • ${confirm} confirm • ${cancel} cancel`
            : `${navigate} navigate • ${confirm} select • ${cancel} cancel`;
        return `${hint}`;
    }
}
