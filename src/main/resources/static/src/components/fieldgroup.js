import { FormGroup, ControlLabel, FormControl, HelpBlock } from 'react-bootstrap';
import React from 'react';

export default function FieldGroup({ id, label, help, ...props }) {
  return (
    <FormGroup controlId={id}>
      <ControlLabel>{label}</ControlLabel>
      <FormControl {...props} />
      {help && <HelpBlock>{help}</HelpBlock>}
    </FormGroup>
  );
}