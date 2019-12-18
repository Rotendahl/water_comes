import React from "react";
import RisksDB from "../risks.json";
import trackEvent from "../data-handlers/action-logger.js";

export default function Resume(props) {
  let factors =
    props.floodType === "skybrud" ? rainFactors(props) : floodFactors(props);

  const logClick = title => {
    trackEvent({
      description: `Faneblad: ${props.floodType}`,
      eventLabel: `Resume: ${title}`,
      cloudbirstDimension: props.dangers.rain_threat,
      floodDimension: props.dangers.flood.risk
    });
  };
  factors = factors.map((factor, i) => (
    <div key={i}>
      <p dangerouslySetInnerHTML={{ __html: factor.text }} />
      {factor.link !== undefined ? (
        <p className="inline-links-in-article">
          <span className="category orange">Læs også: </span>
          <a
            href={factor.link.url}
            onClick={() => logClick(factor.text)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {factor.link.title}
          </a>
        </p>
      ) : (
        ""
      )}
    </div>
  ));
  return (
    <div className="water-comes-app-taken">
      <h3>Det kan du gøre</h3>
      {factors}
      <div className="frame-layout-1">
        <p>
          Når først DMI har varslet skybrud eller stormflod, er det begrænset,
          hvad du kan gøre. Men du kan hente vores overskuelige tjekliste med
          gode råd for at se, hvad du kan gøre her og nu.
        </p>
        <p className="inline-links-in-article">
          <span className="category orange">Anbefaling: </span>
          <a
            onClick={() => {
              logClick("Tjekliste");
            }}
            href="https://www.bolius.dk/fileadmin/user_upload/Tjekliste_til_klimasikring_af_boligen_fra_Videncentret_Bolius.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            Hent tjeklisten her
          </a>
        </p>
        <p>
          Beregnerens vurdering er vejledende og kan aldrig erstatte en faglig
          gennemgang, der omfatter alle din boligs konkrete forhold.
        </p>
      </div>
    </div>
  );
}

function floodFactors(props) {
  let factors = [];
  factors.push({
    text: RisksDB.results[props.floodType][props.threatLevel],
    link:
      props.threatLevel !== "low"
        ? RisksDB.results[props.floodType].links[0]
        : undefined
  });
  if (props.threatLevel !== "low") {
    factors.push({ text: "", link: RisksDB.results[props.floodType].links[1] });
  }
  return factors;
}

function rainFactors(props) {
  let factors = [];
  factors.push({
    text: RisksDB.results[props.floodType][props.threatLevel],
    link:
      props.threatLevel === "low"
        ? RisksDB.results[props.floodType].link
        : undefined
  });

  if (props.dangers.basement.risk === "high") {
    factors.push(RisksDB.results.basement);
  }

  if (props.dangers.hollowing.risk === "high") {
    factors.push(RisksDB.results.hollwing);
  }

  if (props.dangers.conductivity.risk !== "low") {
    factors.push({
      text: RisksDB.results.conductivity[props.dangers.conductivity.risk],
      link: RisksDB.results.conductivity.link
    });
  }
  if (props.dangers.fastningDegree.risk !== "low") {
    factors.push({
      text: RisksDB.results.fastningDegree[props.dangers.fastningDegree.risk],
      link: RisksDB.results.fastningDegree.link
    });
  }
  return factors;
}
