import React from 'react';
import styled from 'styled-components';
import {Container, Row, Col} from 'reactstrap'
import Action from './action.js'
import { Button } from './button.js'


const ActionHeader = styled(Row)`
  font-size: 1.4em;
  font-weight: 500;
  margin-bottom: 0.4em;
`;

export default class ActionsTaken extends React.Component {
  constructor(props){
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.setKey = this.setKey.bind(this);
    this.state = {
      actionsTaken: []
    };
  };

  setKey(key) {
    let newKeyList =
    (this.state.actionsTaken.includes(key)) ? this.state.actionsTaken.filter((i) => {return i !== key})
    : this.state.actionsTaken.concat(key)
    this.setState({ actionsTaken: newKeyList });
  }

  handleChange(event) {
    this.props.setActions( this.state.actionsTaken )
  }

  render() {
    return (
      <Container>
        <ActionHeader>
          Hvad har du gjort for at forbygge oversvømmelse?
        </ActionHeader>
        <Row>
          Fortæl os, hvad du selv har gjort for at forebygge oversvømmelse.
          Sæt hak ud for de ting, du har fået lavet. Har du intet gjort,
          kan du blot trykke ’Vis anbefalinger’
        </Row>
        <div className="actionContainer">
          {this.props.actions.map( (item) => (
            <Action task={item.action} key={item.id} keyId={item.id} setKey={this.setKey}/>
          ))}
        </div>
        <Row>
          <Col sm={{size:"6", offset:6}}>
            <Button block onClick={this.handleChange}>
              Beregn Anbefalinger
            </Button>
          </Col>
        </Row>
    </Container>);
  }
}
