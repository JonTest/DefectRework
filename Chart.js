Ext.define('DefectTrendRemixedApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',



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
              '#FF0000', // reopened: red
              '#C3F500', // new: green
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
                categories: ['01/01/2012', '01/02/2012', '01/03/2012', '01/04/2012', '01/05/2012'],
                title: {
                  text: 'Iteration 6: Jan 01 - Jan 15, 2012'
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
              data: [5, 3, 4, 7, 2],
              stack: 'arrival'
          }, {
              name: 'New',
              data: [3, 4, 4, 2, 5],
              stack: 'arrival'
          }, {
              name: 'Rejected',
              data: [2, 5, 6, 2, 1],
              stack: 'kill'
          }, {
              name: 'Closed',
              data: [3, 6, 4, 4, 3],
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
    launch: function() {
      this._loadChart();
    }
});
    

