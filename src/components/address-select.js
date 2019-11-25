import React from "react";
import { Row, Col, Input, Form, Button } from "reactstrap";
import { BeatLoader as Loader } from "react-spinners";
import constructQuery from "../graphQL_query.js";
import trackEvent from "../action_logger.js";
import computeRainRisk from "../helpers/rain_risk.js";

export default class AdressSelect extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.getData = this.getData.bind(this);
    this.state = {
      isLoading: false,
      address: "",
      finalAddress: "",
      dawa: require("dawa-autocomplete2")
    };
  }

  async getData(dawa_res) {
    this.setState({ isLoading: true });
    let kvhx = await fetch(dawa_res.data.href)
      .then(resp => resp.json())
      .then(data => data.kvhx);

    const houseData = await fetch(process.env.REACT_APP_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: constructQuery(kvhx)
    })
      .then(response => response.json())
      .then(data => data.data.house);

    console.log(houseData);

    let result = await {
      isApartment: houseData.bbrInfo.propType === "Etageboliger",
      text: houseData.bbrInfo.address,
      dangers: {
        basement: { risk: houseData.bbrInfo.hasBasement ? "high" : "low" },
        flood: houseData.waterRisk.flood,
        hollowing: houseData.waterRisk.hollowing,
        fastningDegree: houseData.waterRisk.fastningDegree,
        conductivity: houseData.waterRisk.conductivity
      }
    };
    result.dangers.rain_threat = computeRainRisk(result.dangers);

    trackEvent({
      description: "Adresse indtastet",
      // Gets 2300 københavn part of adrress
      eventLabel: result.text
        .split(",")
        .slice(-1)
        .pop(),
      cloudbirstDimension: result.dangers.rain_threat,
      floodDimension: result.dangers.flood.risk
    });
    this.props.setData(result);
  }

  handleChange(event) {
    var target = event.target.value;

    this.setState((prevState, props) => ({
      address: target
    }));
    var selectHandler = this.getData; // Hack: 'this' changes meaning in call
    var that = this;
    this.state.dawa.dawaAutocomplete(
      document.getElementById("dawa-autocomplete-input"),
      {
        select: dawa_res => {
          that.setState({ isLoading: true });
          selectHandler(dawa_res);
        }
      }
    );
  }
  render() {
    if (this.state.isLoading) {
      return (
        <Loader
          sizeUnit={"px"}
          size={25}
          color={"rgb(207, 227, 227)"}
          loading={true}
        />
      );
    } else {
      return (
        <div className="water-comes-app-address">
          <h2>Tjek risikoen for, at din bolig bliver oversvømmet</h2>

          <p>
            Tast din adresse og få indblik i, hvad der kan påvirke din boligs
            risiko for oversvømmelse ved skybrud eller stormflod. Du får også
            konkrete råd til, hvad du kan gøre for at sikre din bolig.
          </p>

          <p>
            Vær opmærksom på, at resultatet er baseret på offentligt
            tilgængelige data, som kan være behæftet med usikkerheder.{" "}
            <button
              className="btn btn-link"
              onClick={this.props.toggleDataModal}
            >
              Læs mere om datagrundlaget her.
            </button>
          </p>

          <Form
            onSubmit={e => {
              e.preventDefault();
            }}
          >
            <Row>
              <Col md={{ size: "9" }} sm={"8"}>
                <div className="autocomplete-container">
                  <Input
                    type="search"
                    value={this.state.address}
                    onChange={this.handleChange}
                    id="dawa-autocomplete-input"
                    placeholder="Indtast din adresse...."
                  />
                </div>
              </Col>
              <Col md={{ size: "3" }} sm={"4"} className="align-right">
                <Button color="primary">Tjek risiko</Button>
              </Col>
            </Row>
          </Form>
          <p className="small">
            Risikoberegneren egner sig ikke til lejligheder. Vi gemmer ikke din
            adresse. Læs vores{" "}
            <a href="https://www.bolius.dk/cookiepolitik-og-retningslinjer-paa-bolius-platforme">
              cookiepolitik og øvrige retningslinjer
            </a>
            .
          </p>
        </div>
      );
    }
  }
}
