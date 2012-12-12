Ext.define('DefectTrendRemixedApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',

    launch: function() {
      Ext.create('Rally.data.lookback.SnapshotStore', {
          autoLoad: true,
          listeners: {
            load: function(store, data, success) {
                console.log('Loaded Data', data);
            }
        },
        fetch: ['Name', 'State', 'Owner'],
        filters: [
            {
                property: '_TypeHierarchy',
                operator: 'in',
                value: ['Defect']
            }
        ]
    });

}});
    

