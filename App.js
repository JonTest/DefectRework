Ext.define('DefectTrendRemixedApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    // define items inside "outer" app container
    items: [
        {xtype: 'container',
         itemId: 'bigNumber',
         componentCls: 'reworkCountNumber'}
         ],
    launch: function() {

        console.log(this.getContext().getDataContext());
        console.log(this.getContext().getProject());
        
      Ext.create('Rally.data.lookback.SnapshotStore', {
        context: this.getContext().getDataContext(), //get workspace, project info, etc from the app context
        autoLoad: true,

        listeners: {
            scope: this,
          load: function(store, data, success) {
            console.log(data);

            var uniqueDefects = store.collect("_UnformattedID", false, true);
            console.log('Total:', store.count());
            console.log('Unique:', uniqueDefects.length);
            this.down('#bigNumber').update(uniqueDefects.length);

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
              value: this.getContext().getProject().ObjectID
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
    

