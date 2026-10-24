import type { WlContextMenu, WlMenu, WlMenuCheckEvent, WlMenuItem } from "../src";
interface Project extends WlMenuItem<Project> { projectId: number }
type MenuProps = Parameters<typeof WlMenu<Project>>[0];
type ContextProps = Parameters<typeof WlContextMenu<Project>>[0];
type Context = NonNullable<ReturnType<typeof WlContextMenu<Project>>["__ctx"]>;
export function menuHierarchyTypes(context: Context): void {
  const items: readonly Project[] = [{
    label: "Project", projectId: 1, items: [{
      label: "Pinned", projectId: 2, type: "checkbox", checked: true,
      command: (item) => item.projectId.toFixed(),
      onCheckedChange: (checked, item) => {
        item.projectId.toFixed();
        checked.valueOf();
      }
    }]
  }];
  const menu: MenuProps = { items, popup: true, placement: "right", align: "end", onCheck: (event) => event.item.projectId.toFixed() };
  const target: ContextProps = { items, onCheck: (event: WlMenuCheckEvent<Project>) => event.item.projectId.toFixed() };
  context.emit("check", { item: items[0]!, checked: false });
  // @ts-expect-error Check events carry a boolean requested value.
  context.emit("check", { item: items[0]!, checked: "mixed" });
  // @ts-expect-error Nested items retain the consumer's required project data.
  const missing: MenuProps = { items: [{ label: "Project", projectId: 1, items: [{ label: "No id" }] }] };
  // @ts-expect-error Item callbacks cannot use an unrelated payload.
  const callback: ContextProps = { items: [{ projectId: 1, onCheckedChange: (_checked, item: { slug: string }) => item.slug }] };
  // @ts-expect-error Menu placement remains a closed union.
  const placement: MenuProps = { placement: "diagonal" };
  void [menu, target, missing, callback, placement];
}
