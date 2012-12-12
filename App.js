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
            var uniqueDefects = store.collect("_UnformattedID", false, true);
            console.log('Total:', store.count());
            console.log('Unique:', uniqueDefect.length);
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
              operator: '=',
              value: 280784858
          },
          {
              property: '_PreviousValues.State',
              operator: 'eq',
              value: 'Closed' 
          },
          {
              property: 'State',
              operator: 'lte',
              value: 'Closed' 
          }
        ]
      });
    }
});
    

