Ext.define('DefectReworkChartApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    statics: {
        ThirtyDaysBack: -30,
        SixtyDaysBack: -60,
        NinetyDaysBack: -90
    },
    _loadFilters: function() {
      // Add 30/60/90 links
      this.add(
        {
          // Turns free-form text (e.g. 30days) into bonafide Ext objects 
          // to which we can inherit tons-o-methods
          xtype: 'container',
          itemId: 'daySelection',
          renderTpl: '<span id="{id}-s30">30 days</span>  |  <span id="{id}-s60">60 days</span>  |  <span id="{id}-s90">90 days</span>',
          childEls: ["s30", "s60", "s90"],
          listeners: {
            scope: this,
            afterrender: function(cmp) {
                // set defaults for initial loading
                cmp.s30.addCls('selected');
                cmp.s60.addCls('notselected');
                cmp.s90.addCls('notselected');
              
              // click event handlers
                cmp.s30.on('click', function(eventObj) {
                    //select the "30" label, deselect the other labels
                    //check to see if 30 is already the enabled label, is so just no-op
                    if(this.down("#daySelection").s30.hasCls('selected') ){
                        return;
                    }
                    console.log(30); 
                    // update labels appropriately
                    this.down("#daySelection").s30.removeCls('selected').removeCls('notselected').addCls('selected')
                    this.down("#daySelection").s60.removeCls('selected').removeCls('notselected').addCls('notselected');
                    this.down("#daySelection").s90.removeCls('selected').removeCls('notselected').addCls('notselected');
                    this._loadData(DefectTrendRemixedApp.ThirtyDaysBack);
              }, this );
              
              cmp.s60.on('click', function() {
                 if(this.down("#daySelection").s60.hasCls('selected')){
                        return;
                 }
                console.log('60', this);
                this.down("#daySelection").s60.removeCls('selected').removeCls('notselected').addCls('selected')
                this.down("#daySelection").s30.removeCls('selected').removeCls('notselected').addCls('notselected');
                this.down("#daySelection").s90.removeCls('selected').removeCls('notselected').addCls('notselected');

                this._loadData(DefectTrendRemixedApp.SixtyDaysBack);
              }, this);
              
              cmp.s90.on('click', function() {
                  if(this.down("#daySelection").s90.hasCls('selected')) {
                      return;
                  }
                console.log('90');
                this.down("#daySelection").s90.removeCls('selected').removeCls('notselected').addCls('selected')
                this.down("#daySelection").s60.removeCls('selected').removeCls('notselected').addCls('notselected');
                this.down("#daySelection").s30.removeCls('selected').removeCls('notselected').addCls('notselected');
                this._loadData(DefectTrendRemixedApp.NinetyDaysBack);
              }, this);
            }
          },
          style: {
            padding: 10,    // TODO: add bit of padding around 30/60/90
            textAlign: 'center'

          }
        }

      );


    },
    _loadChart: function() {
/**
 * Grid theme for Highcharts JS
 * @author Torstein Hønsi
 */

       chartConfig = {
            chart: {
                type: 'column'
            },
            colors: [
              '#888888', // new: yellow
              '#A60000', // reopened: red
              '#DDDDDD', // rejected: grey
              '#333086', // closed: blue
              '#3D96AE', 
              '#DB843D', 
              '#92A8CD', 
              '#A47D7C', 
              '#B5CA92'
            ],
            title: {
                text: 'Defect Arrival / Kill'
            },
            xAxis: {
                categories: ['01/01', '01/02', '01/03', '01/04', '01/05', '01/06', '01/07'],
                title: {
                  text: 'Last 30 Days'
                }
            },
            yAxis: {
                allowDecimals: false,
                min: 0,
                title: {
                    text: 'Number of Defects'
                }
            },
    
            tooltip: {
                formatter: function() {
                    return '<b>'+ this.x +'</b><br/>'+
                        this.series.name +': '+ this.y +'<br/>'+
                        'Total: '+ this.point.stackTotal;
                }
            },
    
          series: [{
              name: 'Reopened',
              data: [5, 3, 4, 7, 2, 1, 4, 9],
              stack: 'arrival'
          }, {
              name: 'New',
              data: [3, 4, 4, 2, 5, 4, 2, 1],
              stack: 'arrival'
          }, {
              name: 'Rejected',
              data: [2, 5, 6, 2, 1, 2, 4, 1],
              stack: 'kill'
          }, {
              name: 'Closed',
              data: [3, 6, 4, 4, 3, 2, 3, 4],
              stack: 'kill'
          }],

            plotOptions: {
                area: {
                    marker: {
                      enabled: true
                    },
                  cursor: 'Pointer',
                  stacking: 'normal',
                  events: {
                    click: function(event) {
                      alert('click foo');
                    }
                  },
                },
                column: {
                    stacking: 'normal'
                }
            }
        };

      chart = {
        xtype: 'rallychart',
        height: 400,
        chartConfig: chartConfig
      };

      this.add(chart);

    },
    _loadData: function(daysShift) {
      console.log("Reloading Data " + daysShift);
    },
    _onDaysBackChanged: function(daysShift, sender) {

      console.log("GOT THIS");
      // prevent consuming own messages
      /* FIXME - didn't work for demo
      if (sender === this) {
        return;
      }
      */

      // REFACTOR: copied; need to share
      if (daysShift == -30) {
        //select the "30" label, deselect the other labels
        //check to see if 30 is already the enabled label, is so just no-op
        if(this.down("#daySelection").s30.hasCls('selected') ){
            return;
        }
        console.log(30); 
        // update labels appropriately
        this.down("#daySelection").s30.removeCls('selected').removeCls('notselected').addCls('selected')
        this.down("#daySelection").s60.removeCls('selected').removeCls('notselected').addCls('notselected');
        this.down("#daySelection").s90.removeCls('selected').removeCls('notselected').addCls('notselected');
        this._loadData(DefectTrendRemixedApp.ThirtyDaysBack);
        //Rally.environment.getMessageBus().publish('DefectTrendRemixedApp.daysShifted', DefectTrendRemixedApp.ThirtyDaysBack, this);
        } else if (daysShift == -60) {
         if(this.down("#daySelection").s60.hasCls('selected')){
                return;
         }
        console.log('60', this);
        this.down("#daySelection").s60.removeCls('selected').removeCls('notselected').addCls('selected')
        this.down("#daySelection").s30.removeCls('selected').removeCls('notselected').addCls('notselected');
        this.down("#daySelection").s90.removeCls('selected').removeCls('notselected').addCls('notselected');

        this._loadData(DefectTrendRemixedApp.SixtyDaysBack);
        //Rally.environment.getMessageBus().publish('DefectTrendRemixedApp.daysShifted', DefectTrendRemixedApp.ThirtyDaysBack, this);
      } else if (daysShift == -90) {
        if(this.down("#daySelection").s90.hasCls('selected')) {
              return;
          }
        console.log('90');
        this.down("#daySelection").s90.removeCls('selected').removeCls('notselected').addCls('selected')
        this.down("#daySelection").s60.removeCls('selected').removeCls('notselected').addCls('notselected');
        this.down("#daySelection").s30.removeCls('selected').removeCls('notselected').addCls('notselected');
        this._loadData(DefectTrendRemixedApp.NinetyDaysBack);
        //Rally.environment.getMessageBus().publish('DefectTrendRemixedApp.daysShifted', DefectTrendRemixedApp.ThirtyDaysBack, this);
      }
    },

    launch: function() {
      this._loadFilters();
      this._loadChart();
      Rally.environment.getMessageBus().subscribe('DefectTrendRemixedApp.daysShifted', this._onDaysBackChanged, this);
    }
});
    

