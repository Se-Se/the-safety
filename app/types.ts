export interface AppMenu {
  title: string;
  icon?: string;
  items: (AppMenuItem | AppMenuLabel | AppSubMenu)[];
}

/**
 * 一个可路由的菜单项，至少包括 `title` 和 `route` 属性
 */
export interface AppMenuItem {
  /**
   * 菜单的标题
   */
  title: string;

  /**
   * 菜单的路由
   */
  route: string;

  /**
   * 菜单显示的图标
   */
  icon?: string;

  /**
   * 菜单激活时显示的图标
   */
  iconActive?: string;

  /**
   * 菜单打开的目标位置，默认为 _self 在当前页面打开，配置为 _blank
   */
  target?: "_self" | "_blank";

  /**
   * 是否渲染一个“外部链接”图标
   */
  outerLinkIcon?: boolean;
}

/**
 * 一个菜单分类标签，仅包含 `label` 属性
 */
export interface AppMenuLabel {
  label: string;
}

/**
 * 一个子菜单项，包括 `title` 和 `items` 属性
 */
export interface AppSubMenu {
  /**
   * 子菜单明名称
   */
  title: string;

  /**
   * 包含的子菜单项
   */
  items: AppMenuItem[];

  /**
   * 子菜单图标
   */
  icon?: string;

  /**
   * 子菜单激活图标
   */
  iconActive?: string;
}

/**
 * 应用路由映射
 */
export interface AppRouteMap {
  [key: string]: AppEntry;
}

/**
 * 路由入口定义
 */
export type AppEntry = React.ComponentType<any> | AppEntryDetail;

export type AppEntryDetail = {
  /**
   * 路由渲染组件
   */
  component?: React.ComponentType<any>;

  /**
   * 路由渲染方法，需返回一个 React.ReactNode
   */
  render?: () => JSX.Element;
};
