import { Component, truncateToWidth, matchesKey } from "@earendil-works/pi-tui";

interface SelectListTheme {
    selectedItem: (text: string) => string;
    noMatch: (text: string) => string;
}

export class SelectList implements Component {
    private options: string[];
    private multiSelect: boolean;
    private theme: SelectListTheme;

    private selectedItems: Set<string> = new Set();
    private currentIndex: number = 0;

    public onSelect: (items: string[]) => void = () => { };
    public onCancel: () => void = () => { }

    constructor(options: string[], multiSelect: boolean, theme: SelectListTheme) {
        this.options = options;
        this.multiSelect = multiSelect;
        this.theme = theme;
    }
    render(width: number): string[] {
        let lines: string[] = [];
        if (this.options.length === 0) {
            lines.push(this.theme.noMatch("  (no options)"));
        } else {
            this.options.forEach((option, index) => {
                if (this.multiSelect) {
                    const isSelected = this.selectedItems.has(option);
                    const isCurrent = index === this.currentIndex;

                    let prefix = isSelected ? "• " : "◦ ";
                    prefix = isSelected || isCurrent ? this.theme.selectedItem(prefix) : prefix;
                    const label = isSelected || isCurrent ? this.theme.selectedItem(option) : option
                    lines.push(truncateToWidth(prefix + label, width));
                } else {
                    const isCurrent = index === this.currentIndex;
                    const prefix = isCurrent ? this.theme.selectedItem("• ") : "◦ ";
                    const label = isCurrent ? this.theme.selectedItem(option) : option
                    lines.push(truncateToWidth(prefix + label, width));
                }

            })
            lines.push("");
            if (this.multiSelect) {
                lines.push(this.theme.noMatch(truncateToWidth("↑↓ navigate • space select/deselect • enter confirm • esc/ctrl+c cancel", width)));
            } else {
                lines.push(this.theme.noMatch(truncateToWidth("↑↓ navigate • enter select • esc/ctrl+c cancel", width)));
            }
        }
        return lines;
    }
    handleInput(data: string) {
        if (matchesKey(data, "escape") || matchesKey(data, "ctrl+c")) {
            this.onCancel();
            return;
        }
        if (matchesKey(data, "up")) {
            this.currentIndex = (this.currentIndex - 1 + this.options.length) % this.options.length;
            return;
        }
        if (matchesKey(data, "down")) {
            this.currentIndex = (this.currentIndex + 1) % this.options.length;
            return;
        }
        if (this.multiSelect) {
            if (matchesKey(data, "space")) {
                const selectedOption = this.options[this.currentIndex];
                if (this.selectedItems.has(selectedOption)) {
                    this.selectedItems.delete(selectedOption);
                } else {
                    this.selectedItems.add(selectedOption);
                }
            }
            if (matchesKey(data, "enter")) {
                this.onSelect(Array.from(this.selectedItems));
                return;
            }
        } else {
            if (matchesKey(data, "enter")) {
                this.onSelect([this.options[this.currentIndex]]);
                return;
            }
        }
    }
    invalidate() { }
}