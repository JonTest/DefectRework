Ext.define('DefectTrendRemixedApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',

    launch: function() {

      Ext.create('Rally.data.lookback.SnapshotStore', {
        context: {
          workspace: '/workspace/41529001',   // FIXME - scope
          projectScopeUp: false,
          projectScopeDown: false
        },
        autoLoad: true,
        listeners: {
          load: function(store, data, success) {
            console.log(data);

            var uniqueDefects = store.collect("_UnformattedID", false, true);
            console.log('Total:', store.count());
            console.log('Unique:', uniqueDefects.length);

          }
        },
        hydrate: ['State', '_PreviousValues'],
        fetch:  ['_UnformattedID', 'Project', 'Name', 'State', 'Owner', '_PreviousValues'],
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
              property: 'State',
              operator: '<',
              value: 'Closed'
          },
          {
              property: '_PreviousValues.State',
              operator: '=',
              value: 'Closed' 
          }

        ]
      });
    }
});
    

