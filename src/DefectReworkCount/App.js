//
// Rally App: Defect Rework Count
//
// Description: This app shows a simple count of defects who's state has 'thrashed' between
//              two values (e.g. Closed to Open).
//
Ext.define('DefectReworkCountApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    itemId: 'DefectReworkApp',
    items: [
        {
            xtype: 'container',
            itemId: 'countDisplayAndText',
            items: [
                {
                  xtype: 'component',
                  itemId: 'countDisplay',
                  componentCls: 'reworkCountNumber',
                },
                {
                  xtype: 'component',
                  itemId: 'countDisplayText',
                  componentCls: 'reworkCountText',
                }
            ]
        },
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

    // Entry point for launching the app
    launch: function() {
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

    //-------------------------------------------------------------------------
    // Private
    //-------------------------------------------------------------------------

    // Find all defect (snapshots) with Closed>Open transition events
    // Parameter: Numeric, expected to be DayRangePicker.THIRTY | SIXTY | NINETY
    _loadData: function(dayRange) {

        // need to query 'back' that many days so negate the value (e.g. 30 -> -30)
        var daysBack = -dayRange;

        // convert # days back to ISO date string for query
        var daysAgo = Ext.Date.add(new Date(), Ext.Date.DAY, daysBack);
        var daysAgoIsoString = Rally.util.DateTime.toIsoString(daysAgo, true); 

        Ext.create('Rally.data.lookback.SnapshotStore', {
            context: this.getContext().getDataContext(),
            autoLoad: true, 
            listeners: {
                scope: this,
                beforeload: function(store, data, success) {
                    // fade out to indicate loading
                    this.down("#countDisplayAndText").animate({
                        duration: 1000,
                        to: {
                            opacity: 0.2
                        }
                    });
                },
                load: function(store, data, success) {
                    var uniqueDefects = store.collect("_UnformattedID", false, true);
                    console.log('Loaded defects: [Total:', store.count(),', Unique:', uniqueDefects.length, ']');
                    this._updateDisplayCount(uniqueDefects.length);
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
                }
        });
    },

    // Update both the display count and text with new number given.
    // Parameter: Numeric >= 0 count to display
    _updateDisplayCount: function(displayCount) {
        var displayText = 'Reworked Defect'
        if (displayCount === 0 || displayCount > 1) {
            displayText += "s"
        }

        // update displays
        this.down('#countDisplay').update(displayCount.toString()); // convert # to string otherwise 0 won't show
        this.down('#countDisplayText').update(displayText);

        // fade back in
        this.down("#countDisplayAndText").animate({
            duration: 2000,
            to: {
                opacity: 1
            }
        });
    }
});

