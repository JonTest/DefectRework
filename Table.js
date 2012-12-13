
/*
    1) fetch snapshots
    2) org data
      * [model] bucketize by defects -> [snapshots]
      * [view] transform / calculate (storage for grid)
    3) wire up grid with the view data
*/

Ext.define('DefectTrendRemixedApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    launch: function() {
      this._loadData(-90);
    },

    // for every element in the store (e.g. 100), slot it into a data structure
    // key'd by the unique defect id.
    _bucketData: function(defectSnapshotStore) {
        console.log('foo', defectSnapshotStore);
        var uniqueDefects = defectSnapshotStore.collect("_UnformattedID", false, true);
        console.log('# Unique:', uniqueDefects.length);

        // outer container for our data
        indivDefects = {};
        // prime unique entries for each defect, seeding empty storage for snapshots
        Ext.Array.each(uniqueDefects, function(defect) {
          indivDefects[defect] = {"snapshots": []};
        });
        // loop through all (e.g. 100) snapshots and filter/push into data structure
        defectSnapshotStore.each(function(snapshot) {
          indivDefects[snapshot.get("_UnformattedID")].snapshots.push(snapshot)
        });

        for (defectId in indivDefects) {
            defectMeta = indivDefects[defectId];
            defectMeta.Name = defectMeta.snapshots[0].get("Name");   // TODO: consider most recent entry?
        }

        console.log(indivDefects);
    },
    _loadData: function(daysShift) {
         var daysAgo = Ext.Date.add(new Date(), Ext.Date.DAY, daysShift);
         var daysAgoIsoString = Rally.util.DateTime.toIsoString(daysAgo, true); 
         Ext.create('Rally.data.lookback.SnapshotStore', {
           context: this.getContext().getDataContext(), //get workspace, project info, etc from the app context
           autoLoad: true, 
           listeners: {
              scope: this,
              load: function(store, data, success) {
              console.log("Snapshot Count:", store.count());
              this._bucketData(store);
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
            },
            {
                property: '_ValidFrom',
                operator: '>',
                value: daysAgoIsoString
            }
          ] // End filters
        }); //End EXT.create 

    }
});



/*

      var store = Ext.create('Rally.data.custom.Store', {
              // days active = killdate or current - arrival
              data: [
                  {
                      Name: 'Bug 1234',
                      Owner: 'SummerF',
                      State: 'Closed',
                      ReworkCycles: 13,
                      DaysActive: 15,
                      DaysReworked: 7,
                      FirstCloseDate: '01/02/2012'
                  },
                  {
                      Name: 'Bug 456',
                      Owner: 'DavidT',
                      State: 'Open',
                      ReworkCycles: 7,
                      DaysActive: 11,
                      DaysReworked: 1,
                      FirstCloseDate: '01/05/2012'
                  },
                  {
                      Name: 'Bug 7890',
                      Owner: 'DustyN',
                      State: 'Closed',
                      ReworkCycles: 3,
                      DaysActive: 11,
                      DaysReworked: 3,
                      FirstCloseDate: '01/02/2012'
                  },
                  {
                      Name: 'Bug 7890',
                      Owner: 'DavidT',
                      State: 'Closed',
                      ReworkCycles: 1,
                      DaysActive: 7,
                      DaysReworked: 1,
                      FirstCloseDate: '01/08/2012'
                  },
                  {
                      Name: 'Bug 7890',
                      Owner: 'SummerF',
                      State: 'Closed',
                      ReworkCycles: 1,
                      DaysActive: 5,
                      DaysReworked: 1,
                      FirstCloseDate: '01/02/2012'
                  }
              ]
          });

*/
