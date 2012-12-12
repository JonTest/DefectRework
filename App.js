Ext.define('DefectTrendRemixedApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',

    launch: function() {
      Ext.create('Rally.data.lookback.SnapshotStore', {
        context: {
          workspace: '/workspace/41529001',
          projectScopeUp: false,
          projectScopeDown: false
        },
        autoLoad: true,
        listeners: {
          load: function(store, data, success) {
            var collect = {};
            Ext.Array.forEach(data, function() {
            });
          }
        },
        hydrate: ['Project','State'],
        fetch: ['FormattedID', '_UnformattedID', 'Project', 'Name', 'State', 'Owner'],
        filters: [
          {
              property: '_TypeHierarchy',
              operator: 'in',
              value: ['Defect']
          },
          {
              property: 'Project',
              operator: 'in',
              value: 280784858
          }

        ]
      });
    }
});
    

