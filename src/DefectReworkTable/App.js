//
// Rally App: Defect Rework Table
//
// Description: This app shows a table of defects who's state has 'thrashed' between
//              two values (e.g. Closed to Open).
//
Ext.define('DefectReworkTableApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    items: [
      {
        xtype: 'dayrangepicker',
        itemId: 'dayRangePicker',
        defaultSelection: '30',   // 30|60|90
        autoLoadSelection: true
      }
    ],
    layout: {
      type: 'vbox',
      align: 'stretch'
    },
    indivDefects: null,
    // for every element in the store (e.g. 100), slot it into a data structure
    // key'd by the unique defect id.
    _bucketData: function(defectSnapshotStore) {
        var uniqueDefects = defectSnapshotStore.collect("ObjectID", false, true);
        console.log('# Unique:', uniqueDefects.length);
        this.indivDefects = {};

        // prime unique entries for each defect, seeding empty storage for snapshots
        Ext.Array.each(uniqueDefects, function(defect) {
          this.indivDefects[defect] = {"snapshots": []};
        }, this);
        // loop through all (e.g. 100) snapshots and filter/push into data structure
        defectSnapshotStore.each(function(snapshot) {
          this.indivDefects[snapshot.get("ObjectID")].snapshots.push(snapshot);
        }, this);
        
        this._fetchWholeDefects();
        
    },
    
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
                    this._updateGrid();
                }
            }
          });
        },
    
    _loadData: function(dayRange) {
      var daysBack = -dayRange;    // negative value; need to query 'back' that many days
      // convert # days back to ISO date string for query
      var daysAgo = Ext.Date.add(new Date(), Ext.Date.DAY, daysBack);
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
       rawFind: {
        $and: [
                 { 
                     $or: [
                       { State: {$lt: 'Closed'}, '_PreviousValues.State': 'Closed' },
                       { State: {$lt: 'Fixed' }, '_PreviousValues.State': 'Fixed' },
                    ]   
                 },
                 {
                   _TypeHierarchy: { $in: ['Defect' ] }
                 },
                 {
                   Project : this.getContext().getProject().ObjectID
                 },
                 {
                   _ValidFrom: { $gt : daysAgoIsoString }
                 }
             ]
       sorters: [
           {
               property: "_id",
               direction: "ascending"
           }
       ]
      });
    },
   
    _updateGrid: function() {
        var gridData = [];
        for(defect in this.indivDefects) {
            var defectMeta = this.indivDefects[defect]; // move data from complex object to simple array
            gridData.push(defectMeta);
        }

       var customStore = Ext.create('Rally.data.custom.Store', {
           data: gridData,
       } );

        // find & populate grid
       this.down('#defectGrid').reconfigure(customStore);
        
        // grid layout hidden on load to prevent showing empty grid and waiting few secs to get data
        // this will re-enable and show the first grid with data
        Ext.resumeLayouts(true);
    },

    _initGrid: function(){

      // prevent rendering grid until first data is retrieved and given to grid
      Ext.suspendLayouts();

       var customStore = Ext.create('Rally.data.custom.Store', {
           data: [],
       } );

       this.add({
          xtype: 'rallygrid',
          itemId: 'defectGrid',
          store: customStore,

          columnCfgs: [
              {   
                  text: 'Defect ID', dataIndex: 'FormattedID', flex: 1,
                  xtype: 'templatecolumn', tpl: Ext.create('Rally.ui.renderer.template.FormattedIDTemplate')
              },
              {
                  text: 'Name', dataIndex: 'Name', flex: 2
              },
              {
                  text: 'State', dataIndex: 'State', flex: 1
              }
          ]
      });
    },

    launch: function() {
      this._initGrid();

      // Register what should happen when 30/60/90 links are clicked
      this.down('#dayRangePicker').on({
        scope: this,
        on30clicked: function() {
          this._loadData(DayRangePicker.THIRTY);
        },
        on60clicked: function() {
          this._loadData(DayRangePicker.SIXTY);
        },
        on90clicked: function() {
          this._loadData(DayRangePicker.NINETY);
        }
      });
    },


});

