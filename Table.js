
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
    indivDefects: null,
    launch: function() {
      this._loadData(-90);
    },

    // for every element in the store (e.g. 100), slot it into a data structure
    // key'd by the unique defect id.
    _bucketData: function(defectSnapshotStore) {
        console.log('foo', defectSnapshotStore);
        var uniqueDefects = defectSnapshotStore.collect("ObjectID", false, true);
        console.log('# Unique:', uniqueDefects.length);
        this.indivDefects = {};

        // prime unique entries for each defect, seeding empty storage for snapshots
        Ext.Array.each(uniqueDefects, function(defect) {
          console.log('this ', this);
          this.indivDefects[defect] = {"snapshots": []};
        }, this);
        // loop through all (e.g. 100) snapshots and filter/push into data structure
        defectSnapshotStore.each(function(snapshot) {
          this.indivDefects[snapshot.get("ObjectID")].snapshots.push(snapshot);
        }, this);
        
        this._fetchWholeDefects();
        
    }, //End _bucketData
    
    _fetchWholeDefects: function() {
        var uniqueDefects = Ext.Object.getKeys( this.indivDefects);
        var defectQueryFilter = Ext.create('Rally.data.QueryFilter', {
            property: 'ObjectID',
            operator: '=',
            value: uniqueDefects.pop()
        });

        // build querie of or'd ids
        Ext.Array.each(uniqueDefects, function(uniqueDefect) {
            var query = new Rally.data.QueryFilter( {
            property: 'ObjectID',
            operator: '=',
            value: uniqueDefect
            });

            defectQueryFilter = defectQueryFilter.or(query);

        });
        
        Ext.create('Rally.data.WsapiDataStore', {
            model: 'Defect',
            fetch: ['Name', 'State', '_ref','FormattedID'],
            autoLoad: true,
            filters: [defectQueryFilter],
            listeners: {
                scope: this,
                load: function(store, data, success) {
                    Ext.Array.each(data, function(defect) {
                        console.log('defect obj id ', defect.get('ObjectID'));
                        this.indivDefects[defect.get('ObjectID')].Name = defect.get('Name');
                        this.indivDefects[defect.get('ObjectID')].State = defect.get('State');
                        this.indivDefects[defect.get('ObjectID')]._ref = defect.get('_ref');
                        this.indivDefects[defect.get('ObjectID')].FormattedID = defect.get('FormattedID')
                    }, this);
                    this._loadGrid();
                } //End load
            }  // End listeners     
          }); // End Ext.Create ;
        }, // End _fetchWholeDefects
    
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
          ], // End filters
          sorters: [
              {
                  property: "_id",
                  direction: "ascending"
              }
          ]
        }); //End EXT.create 

    }, // End _loadData
    
    _loadGrid: function(){
        var gridData = [];
        for(defect in this.indivDefects) {
            var defectMeta = this.indivDefects[defect]; // move data from complex object to simple array
            gridData.push(defectMeta);
        }
         var customStore = Ext.create('Rally.data.custom.Store', {
             data: gridData,
         } );
         this.add({
            xtype: 'rallygrid',
            store: customStore,
            columnCfgs: [
                {   
                    text: 'Defect ID', dataIndex: 'FormattedID', flex: 1,
                    xtype: 'templatecolumn', tpl: Ext.create('Rally.ui.renderer.template.FormattedIDTemplate')
                },
                {
                    text: 'Name', dataIndex: 'Name', flex: 1
                },
                {
                    text: 'State', dataIndex: 'State', flex: 1
                }
            ]
        });
    } //End _loadGrid
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
