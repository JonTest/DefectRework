//
// Rally App: Defect Rework Table
//
// Description: This app shows a table of defects who's state has 'thrashed' between
//              two values (e.g. Closed to Open).
//
Ext.define('DefectReworkTableApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    layout: {
      type: 'vbox',
      align: 'stretch'
    },
    snapshotsByDefect: null,

    // Organize all snapshots into temp data structure key'd by unique defect id
    //
    //   {
    //      1234: [ snapshot1, snapshot2, ...],
    //      5678: [ snapshot3, snapshot4, ...],
    //      ...
    //   }
    _organizeDefectSnapshots: function(defectSnapshotStore) {

        var uniqueDefects = defectSnapshotStore.collect("ObjectID", false, true);

        console.log("Snapshot Count:", defectSnapshotStore.count());
        console.log('# Unique:', uniqueDefects.length);

        var snapshotsByDefect = {};

        // loop through all (e.g. 100) snapshots and filter/push into data structure
        defectSnapshotStore.each(function(snapshot) {
            var defectId = snapshot.get("ObjectID");
            if (!snapshotsByDefect.hasOwnProperty(defectId)) {
              snapshotsByDefect[defectId] = {snapshots: [snapshot]};
            } else {
              snapshotsByDefect[defectId].snapshots.push(snapshot);
            }
        });
        this._fetchDefectDetails(snapshotsByDefect);

    },

    // Lookup meta details for the unique defects
    // Augment temp data structure with meta for the current state of the defect
    //  {
    //     1234: {
    //          meta: {
    //              Name: "Foo Defect",
    //              _ref: /defect/1234,
    //          }
    //          snapshots: [snap1, snap2]
    //  
    //     }
    //  }
    //
    _fetchDefectDetails: function(snapshotsByDefect) {

        console.log("fetching defect details", snapshotsByDefect);

        var uniqueDefects = Ext.Object.getKeys(snapshotsByDefect);
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

                        var defectId = defect.get('ObjectID');

                        snapshotsByDefect[defectId].meta = {
                            Name: defect.get('Name'),
                            State: defect.get('State'),
                            _ref: defect.get('_ref'),
                            FormattedID: defect.get('FormattedID')
                        };

                        snapshotsByDefect[defectId].meta.ThrashCount = 
                            snapshotsByDefect[defectId].snapshots.length;

                    }, this);
                    this._updateGrid(snapshotsByDefect);
                }
            }
        });
        console.log("fetched!", snapshotsByDefect);
    },

    // Lookup all snapshots for defects in given day range (e.g. past 30 days)
    _fetchDefectSnapshotsByRange: function(dayRange) {

        var daysBack = -dayRange;        // negative value; need to query 'back' that many days
        // convert # days back to ISO date string for query
        var daysAgo = Ext.Date.add(new Date(), Ext.Date.DAY, daysBack);
        var daysAgoIsoString = Rally.util.DateTime.toIsoString(daysAgo, true); 
        Ext.create('Rally.data.lookback.SnapshotStore', {
            context: this.getContext().getDataContext(), //get workspace, project info, etc from the app context
            autoLoad: true, 
            listeners: {
                scope: this,
                beforeload: function(store, operation, opts) {
                  this.setLoading(true);
                },
                load: function(store, data, success) {
                  console.log('context', this.getContext().getDataContext());
                  console.log('data', data);
                    this._organizeDefectSnapshots(store);
                }
            },
            hydrate: ['State', '_PreviousValues'],
            fetch:    ['_UnformattedID', 'Project', 'Name', 'State', 'Owner', '_PreviousValues'],
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
                        _ProjectHierarchy : this.getContext().getProject().ObjectID
                    },
                    {
                        _ValidFrom: { $gt : daysAgoIsoString }
                    }
                ]
            },
            sorters: [
                {
                    property: "_id",
                    direction: "ascending"
                }
            ]
        });
    },

    _updateGrid: function(snapshotsByDefect) {
        var gridData = [];
        for(defect in snapshotsByDefect) {
            var defectMeta = snapshotsByDefect[defect].meta; // move data from complex object to simple array
            gridData.push(defectMeta);
        }

        var customStore = Ext.create('Rally.data.custom.Store', {
           data: gridData,
        } );

        this.setLoading(false);

        // find & populate grid
        this.down('#defectGrid').reconfigure(customStore);

        // grid layout hidden on load to prevent showing empty grid and waiting few secs to get data
        // this will re-enable and show the first grid with data
        // FIXME need this?  use load mask?
        // Ext.resumeLayouts(true);
    },

    // Create visual components and lay them out
    _doLayout: function(){

      var dayRangePicker = Ext.create('DayRangePicker', {
        xtype: 'dayrangepicker',
        itemId: 'dayRangePicker',
        defaultSelection: '30',   // 30|60|90
        autoLoadSelection: true
      });

      // Register what should happen when 30/60/90 links are clicked
      dayRangePicker.on({
        scope: this,
        on30clicked: function() {
          this._fetchDefectSnapshotsByRange(DayRangePicker.THIRTY);     // <--- LAUNCH POINT
        },
        on60clicked: function() {
          this._fetchDefectSnapshotsByRange(DayRangePicker.SIXTY);
        },
        on90clicked: function() {
          this._fetchDefectSnapshotsByRange(DayRangePicker.NINETY);
        }
      });

      // prevent rendering grid until first data is retrieved and given to grid
      // FIXME: need this?  use mask instead prior to load?
      // Ext.suspendLayouts();

       var customStore = Ext.create('Rally.data.custom.Store', {
           data: [],
       } );

       var defectGrid = Ext.create('Rally.ui.grid.Grid', {
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
              },
              {
                  text: 'Thrash Count in Range', dataIndex: 'ThrashCount', flex: 1
              }
          ]
      });

      this.add(dayRangePicker);
      this.add(defectGrid);
    },

    launch: function() {
      this._doLayout();
    }
});

