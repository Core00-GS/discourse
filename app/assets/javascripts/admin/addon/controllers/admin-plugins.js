import Controller from "@ember/controller";
import { inject as service } from "@ember/service";

export default class AdminPluginsController extends Controller {
  @service router;

  get adminRoutes() {
    return this.allAdminRoutes.filter((route) => this.routeExists(route));
  }

  get brokenAdminRoutes() {
    return this.allAdminRoutes.filter((route) => !this.routeExists(route));
  }

  get allAdminRoutes() {
    return this.model
      .filter((plugin) => plugin?.enabled)
      .map((plugin) => {
        return plugin.adminRoute;
      })
      .filter(Boolean);
  }

  routeExists(route) {
    try {
      if (route.use_new_show_route) {
        this.router.urlFor(route.full_location, route.location);
      } else {
        this.router.urlFor(route.full_location);
      }
      return true;
    } catch (e) {
      return false;
    }
  }
}
