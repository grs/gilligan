/*
Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
*/

import React, { Component } from "react";
import ChordViewer from "../chord/chordViewer";
import PieBar from "./pieBar";
import TimeSeries from "./timeSeries";
import ChartToolbar from "./chartToolbar";
import SkupperLegend from "./legendComponent";
import QDRPopup from "../../../qdrPopup";
import { utils } from "../../../utilities";

export const LINE_CHART = "line";
export const BAR_CHART = "bar";
export const PIE_CHART = "pie";
export const CHORD_CHART = "chord";

const CHART_TYPE_KEY = "chartype";
const CHART_TYPE_DEFAULT = {
  service: PIE_CHART,
  site: PIE_CHART,
  deployment: PIE_CHART,
};

class ChartViewer extends Component {
  constructor(props) {
    super(props);
    this.savedTypes = utils.getSaved(CHART_TYPE_KEY, CHART_TYPE_DEFAULT);
    this.state = {
      type: this.savedTypes[this.props.view],
      duration: "min",
      popupContent: null,
    };
  }

  componentDidMount = () => {
    if (this.props.handleMounted) {
      this.props.handleMounted();
    }
  };
  doUpdate = (type) => {
    if (this.chartRef1 && type !== CHORD_CHART) {
      this.chartRef1.doUpdate(type);
      this.chartRef2.doUpdate(type);
    }
    if (this.chordRef && (type === undefined || type === CHORD_CHART)) {
      this.chordRef.doUpdate();
    }
  };

  init = () => {
    this.setState({ type: this.savedTypes[this.props.view] }, () => {
      if (this.chartRef1) {
        this.chartRef1.init();
        this.chartRef2.init();
      }
      if (this.chordRef) {
        this.chordRef.init();
      }
    });
  };

  handleChangeChartType = (type) => {
    this.savedTypes[this.props.view] = type;
    this.setState({ type }, () => {
      this.doUpdate(type);
      utils.setSaved(CHART_TYPE_KEY, this.savedTypes);
    });
  };

  showTooltip = (content, eventX, eventY) => {
    this.setState({ popupContent: content }, () => {
      if (content) {
        // after the content has rendered, position it
        utils.positionPopup({
          containerSelector: "#skAllCharts",
          popupSelector: "#popover-div",
          constrainY: false,
          eventX,
          eventY,
        });
      }
    });
  };

  render() {
    const { type } = this.state;
    return (
      <React.Fragment>
        <ChartToolbar
          type={type}
          handleChangeChartType={this.handleChangeChartType}
          handleExpandChart={this.props.handleExpandChart}
          handleCloseChart={this.props.handleCloseChart}
          chartExpanded={this.props.chartExpanded}
        />
        <div
          className={`sk-all-charts-container${
            this.props.data !== null ? " chosen" : ""
          }`}
          id="skAllCharts"
        >
          <div
            id="popover-div"
            className={
              this.state.popupContent
                ? "sk-popover-div"
                : "sk-popover-div hidden"
            }
            ref={(el) => (this.popupRef = el)}
          >
            <QDRPopup content={this.state.popupContent}></QDRPopup>
          </div>
          {type === LINE_CHART && (
            <React.Fragment>
              <TimeSeries
                ref={(el) => (this.chartRef1 = el)}
                {...this.props}
                direction="in"
                type={type}
                showTooltip={this.showTooltip}
                duration={this.state.duration}
                comment="Time series chart for incoming metric"
              />
              <TimeSeries
                ref={(el) => (this.chartRef2 = el)}
                {...this.props}
                direction="out"
                type={type}
                showTooltip={this.showTooltip}
                duration={this.state.duration}
                comment="Time series chart for outgoing metric"
              />
            </React.Fragment>
          )}
          {(type === BAR_CHART || type === PIE_CHART) && (
            <React.Fragment>
              <PieBar
                ref={(el) => (this.chartRef1 = el)}
                {...this.props}
                direction="in"
                type={type}
                showTooltip={this.showTooltip}
                duration={this.state.duration}
                comment="Pie or bar chart for incoming metric"
              />
              <PieBar
                ref={(el) => (this.chartRef2 = el)}
                {...this.props}
                direction="out"
                type={type}
                showTooltip={this.showTooltip}
                duration={this.state.duration}
                comment="Pie or bar chart for outgoing metric"
              />
            </React.Fragment>
          )}
          {type === CHORD_CHART && (
            <ChordViewer
              ref={(el) => (this.chordRef = el)}
              {...this.props}
              showTooltip={this.showTooltip}
              noLegend
              type={type}
              comment="Chord chart that shows both incoming and outgoing"
            />
          )}
          <SkupperLegend
            ref={(el) => (this.legendRef = el)}
            {...this.props}
            showTooltip={this.showTooltip}
            comment="Stand-alone legend"
          />
        </div>
      </React.Fragment>
    );
  }
}

export default ChartViewer;
