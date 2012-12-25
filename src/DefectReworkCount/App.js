Ext.define('DefectReworkCountApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    itemId: 'DefectReworkApp',
    items: [
        {
          xtype: 'container',
          itemId: 'bigNumberAndText',
          items: [
            {
              xtype: 'container',
              itemId: 'bigNumber',
              componentCls: 'reworkCountNumber',
            },
            {
              xtype: 'container',
              itemId: 'bigNumberText',
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

    // Find all defect (snapshots) with Closed>Open transition events
    _loadData: function(dayRange) {
      var daysBack = -dayRange;    // negative value; need to query 'back' that many days

      // convert # days back to ISO date string for query
      var daysAgo = Ext.Date.add(new Date(), Ext.Date.DAY, daysBack);
      var daysAgoIsoString = Rally.util.DateTime.toIsoString(daysAgo, true); 

       Ext.create('Rally.data.lookback.SnapshotStore', {
       context: this.getContext().getDataContext(),
       autoLoad: true, 
       listeners: {
          scope: this,
          beforeload: function(store, data, success) {
              this.down("#bigNumberAndText").animate({
                duration: 1000,
                to: {
                  opacity: 0
                }
              });
          },
          load: function(store, data, success) {
            var uniqueDefects = store.collect("_UnformattedID", false, true);

            console.log('Loaded defects. Total:', store.count(),'Unique:', uniqueDefects.length);
            // convert # to string otherwise 0 won't show
            this.down('#bigNumber').update(uniqueDefects.length.toString());

            var displayText = 'Reworked Defect'
            if (uniqueDefects.length > 1) {
              displayText += "s"
            }
            this.down('#bigNumberText').update(displayText);
            Ext.resumeLayouts(true);

            this.down("#bigNumberAndText").animate({
              duration: 1000,
              to: {
                opacity: 100
              }
            });
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
    // App entry point
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
    }
});
    

