import React from 'react';
import renderer from 'react-test-renderer';
import Tools from '../';

test('TabA tools', () => {
  const component = renderer.create(
    <Tools />
  );
  const tools = component.toJSON();
  expect(tools).toMatchSnapshot();
});
