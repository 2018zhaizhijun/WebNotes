import PDF from 'common/components/PDF';
import ReactDOM from 'react-dom';
import React from 'react';

// const app = document.createElement('div');
// app.id = 'custom-app';
// document.body.appendChild(app);

const href = document.location.origin + document.location.pathname;
document.documentElement.style.width = '100%';
document.documentElement.style.height = '100%';

ReactDOM.render(<PDF url={href} />, document.body);
