import React, {Component} from 'react';
import {connect} from 'react-redux';
import {getColumnWidth, getData} from '../selectors/base-selectors';
import {updateData} from '../actions';
import MultiLineChartContainer from '../containers/multi-line-chart-container';
import SlidebarContainer from '../containers/slidebar-svg-container';
import LineIndicatorContainer from '../containers/line-indicator-container';
import StaticbarContainer from '../containers/staticbar-svg-container';

const mapStateToProps = (state, props) => ({
  columnWidth: getColumnWidth(state),
  data: getData(state),
  params: props,
});

const mapDispatchToProps = {updateData};

class App extends Component {
  get containerStyle() {
    return {
      width: '100%',
      display: 'flex',
      overflowX: 'auto',
      overflowY: 'hidden',
    };
  }

  get columnStyle() {
    const {columnWidth} = this.props;
    return {
      position: 'relative',
      width: columnWidth,
    };
  }

  componentDidMount() {
    const {data} = this.props.params;
    this.props.updateData(data);
  }

  _renderColumns() {
    const {data, columnWidth} = this.props;
    return data.map((d, i) => {
      return (
        <div key={i} style={this.columnStyle}>
          <div style={{position: 'relative', width: columnWidth}}>
            <div>
              <MultiLineChartContainer index={i} />
            </div>
            {(data[i].lines || []).map(d => (
              <div key={d.name}>
                <div>{d.name}</div>
                <div>
                  <SlidebarContainer index={i} lineName={d.name} />
                </div>
              </div>
            ))}

            <LineIndicatorContainer index={i} />
          </div>
          <div style={{position: 'relative', width: columnWidth}}>
            {(data[i].lines || []).map(d => (
              <React.Fragment key={d.name}>
                {['treatment', 'control'].map(groupName => (
                  <div key={groupName}>
                    <div>{`${d.name} ${groupName} group`}</div>
                    <div>
                      <StaticbarContainer
                        index={i}
                        lineName={d.name}
                        groupName={groupName}
                      />
                    </div>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      );
    });
  }

  render() {
    return <div style={this.containerStyle}>{this._renderColumns()}</div>;
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
