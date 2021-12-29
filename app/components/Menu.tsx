import { Menu as TeaMenu } from "@tencent/tea-component";
import React from "react";
import { Link, RouteComponentProps, withRouter } from "react-router-dom";
import { AppMenu } from "../types";

interface MenuProps extends RouteComponentProps<any> {
  menu: AppMenu;
}

export default withRouter<MenuProps, React.ComponentType<MenuProps>>(
  function Menu({ location, menu }) {
    const { pathname } = location;
    const route = `${pathname}/`.replace(/^\/(.*[^\/])\/*$/, "/$1/");
    return (
      <TeaMenu
        theme="dark"
        icon={menu.icon}
        collapsable={!!menu.icon}
      >
        {menu.items.map((item, index) => {
          if ("label" in item) {
            return <TeaMenu.Group key={index} title={item.label} />;
          }
          if ("items" in item) {
            return (
              <TeaMenu.SubMenu
                defaultOpened
                key={index}
                title={item.title}
                icon={item.icon}
              >
                {item.items.map((subItem, index) => (
                  <TeaMenu.Item
                    key={index}
                    title={subItem.title}
                    selected={route.includes(`${subItem.route}/`.replace(/^\/(.*[^\/])\/*$/, "/$1/"))}
                    render={children => (
                      <Link to={subItem.route}>{children}</Link>
                    )}
                  />
                ))}
              </TeaMenu.SubMenu>
            );
          }
          return (
            <TeaMenu.Item
              key={index}
              title={item.title}
              icon={item.icon}
              selected={route.includes(`${item.route}/`.replace(/^\/(.*[^\/])\/*$/, "/$1/"))}
              render={children => <Link to={item.route}>{children}</Link>}
            />
          );
        })}
      </TeaMenu>
    );
  }
);
