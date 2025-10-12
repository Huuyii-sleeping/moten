export let installRecords = [];

export const addInstallRecord = (userId, pluginId) => {
  const record = {
    id: installRecords.length + 1,
    userId,
    pluginId,
    installedAt: new Date().toISOString(),
  };
  installRecords.push(record);
  return record;
};

export const getInstalledPluginByUser = (userId) => {
  return installRecords
    .filter((record) => record.userId === userId)
    .map((r) => r.pluginId);
};
