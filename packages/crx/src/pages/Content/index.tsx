import PDF from 'common/components/PDF';
import ReactDOM from 'react-dom';
import React from 'react';

// const app = document.createElement('div');
// app.id = 'custom-app';
// document.body.appendChild(app);

let href = document.location.origin + document.location.pathname;

ReactDOM.render(<PDF url={href} />, document.body);
