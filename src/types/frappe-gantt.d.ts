/**
 * Type declarations for frappe-gantt (no official @types package)
 * Based on frappe-gantt v1.2.x API
 */

declare module "frappe-gantt" {
  export interface Task {
    id: string;
    name: string;
    start: string;
    end: string;
    progress: number;
    dependencies?: string;
    custom_class?: string;
    color?: string;
    [key: string]: unknown;
  }

  export type ViewMode = "Hour" | "Day" | "Week" | "Month" | "Year";

  export interface GanttOptions {
    view_mode?: ViewMode;
    date_format?: string;
    scroll_to?: string | "today" | "start" | "end";
    bar_height?: number;
    bar_corner_radius?: number;
    padding?: number;
    arrow_curve?: number;
    today_button?: boolean;
    view_mode_select?: boolean;
    infinite_padding?: boolean;
    readonly?: boolean;
    readonly_dates?: boolean;
    readonly_progress?: boolean;
    container_height?: number | "auto";
    column_width?: number;
    language?: string;
    lines?: "both" | "horizontal" | "vertical" | "none";
    auto_move_label?: boolean;
    move_dependencies?: boolean;
    show_expected_progress?: boolean;
    popup?: ((options: PopupOptions) => string | false | void) | false;
    popup_on?: "click" | "hover";
    on_click?: (task: Task) => void;
    on_date_change?: (task: Task, start: Date, end: Date) => void;
    on_progress_change?: (task: Task, progress: number) => void;
    on_view_change?: (mode: ViewMode) => void;
  }

  export interface PopupOptions {
    task: Task;
    chart: Gantt;
    get_title: () => HTMLElement;
    get_subtitle: () => HTMLElement;
    get_details: () => HTMLElement;
    set_title: (html: string) => void;
    set_subtitle: (html: string) => void;
    set_details: (html: string) => void;
    add_action: (html: string, func: () => void) => void;
  }

  export default class Gantt {
    tasks: Task[];

    constructor(
      wrapper: HTMLElement | string,
      tasks: Task[],
      options?: GanttOptions,
    );

    /** Change the current view mode */
    change_view_mode(mode: ViewMode, maintain_pos?: boolean): void;

    /** Scroll to today's date */
    scroll_current(): void;

    /** Re-render after updating options */
    update_options(new_options: Partial<GanttOptions>): void;

    /** Update a single task bar */
    update_task(task_id: string, new_details: Partial<Task>): void;

    /** Re-render all tasks */
    refresh(): void;
  }
}
