import { plugins } from "../models/plugins.js";
import { response } from "../utils/response.js";
import {
  addInstallRecord,
  getInstalledPluginByUser,
} from "../models/installPlugins.js";
export class PluginController {
  findAll() {
    const handler = async (req, res) => {
      if (req.query) {
        const { status } = req.query;
        if (status) {
          const uniPlugins = plugins.filter((p) => p.status === status);
          return res.json(response.success(uniPlugins));
        }
      }
      return res.json(response.success(plugins));
    };
    return [handler];
  }

  findOne() {
    const handler = async (req, res) => {
      const id = parseInt(req.params.id);
      const plugin = plugins.find((p) => p.id === id);
      if (!plugin) return res.json(response.fail("not fount the plugin"));
      res.json(response.success(plugin));
    };
    return [handler];
  }

  install() {
    const handler = async (req, res) => {
      const { pluginId } = req.body;
      const userId = req.auth?.id;
      if (!userId) {
        return res.json(response.authorizeFailed());
      }
      const plugin = plugins.find((p) => p.id === parseInt(pluginId));
      if (!plugin) {
        return res.json(response.fail("插件不存在"));
      }
      const record = addInstallRecord(userId, parseInt(pluginId));
      res.json(response.success(record));
    };
    return [handler];
  }

  getInstalled() {
    const handler = async (req, res) => {
      const userId = req.auth?.id;
      if (!userId) {
        return res.json(response.authorizeFailed());
      }
      const installedPluginIds = getInstalledPluginByUser(userId);
      const installedPlugins = plugins.filter((p) =>
        installedPluginIds.includes(p.id)
      );
      res.json(response.success(installedPlugins));
    };
    return [handler];
  }

  approvePlugin() {
    const handler = async (req, res) => {
      const { pluginId } = req.body;
      const plugin = plugins.find((p) => p.id === pluginId);
      if (!plugin) {
        return res.json(response.fail("插件不存在"));
      }
      if (plugin.status !== "pending") {
        return res.json(response.fail("插件的状态不是待审核"));
      }
      plugin.status = "published";
      plugin.publishedAt = new Date().toISOString();
      res.json(response.success(plugin));
    };
    return [handler];
  }

  rejectPlugin() {
    const handler = async (req, res) => {
      const { pluginId } = req.body;
      const plugin = plugins.find((p) => p.id === pluginId);
      if (!plugin) {
        return res.json(response.fail("插件不存在"));
      }
      if (plugin.status !== "pending") {
        return res.json(response.fail("插件的状态不是待审核"));
      }
      plugin.status = "rejected";
      plugin.rejectedAt = new Date().toISOString();
      res.json(response.success(plugin));
    };
    return [handler];
  }
}
