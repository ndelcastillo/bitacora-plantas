import { test } from 'node:test';
import assert from 'node:assert/strict';
import { angleForIndex, extraerPlantasDelDom } from './catalog-gallery-3d.js';

test('angleForIndex reparte 360 grados entre los ítems, arrancando en -90', () => {
  assert.equal(angleForIndex(0, 4), -90);
  assert.equal(angleForIndex(1, 4), 0);
  assert.equal(angleForIndex(2, 4), 90);
  assert.equal(angleForIndex(3, 4), 180);
});

test('angleForIndex con un solo ítem no divide por cero', () => {
  assert.equal(angleForIndex(0, 1), -90);
});

function fakeEntry(nombre, imagen) {
  return {
    querySelector(selector) {
      if (selector === '.catalog-tile-name') {
        return imagen === null && nombre === null ? null : { textContent: nombre };
      }
      if (selector === '[data-imagen]') {
        return imagen ? { dataset: { imagen } } : null;
      }
      return null;
    },
  };
}

test('extraerPlantasDelDom lee nombre e imagen de cada .catalog-entry', () => {
  const root = {
    querySelectorAll(selector) {
      assert.equal(selector, '.catalog-entry');
      return [
        fakeEntry('Aglaonema', 'https://example.com/a.jpg'),
        fakeEntry('Potus', 'https://example.com/b.jpg'),
      ];
    },
  };
  const plantas = extraerPlantasDelDom(root);
  assert.deepEqual(plantas, [
    { nombre: 'Aglaonema', imagen: 'https://example.com/a.jpg' },
    { nombre: 'Potus', imagen: 'https://example.com/b.jpg' },
  ]);
});

test('extraerPlantasDelDom descarta entries sin imagen', () => {
  const root = {
    querySelectorAll() {
      return [fakeEntry('Sin imagen', null), fakeEntry('Con imagen', 'https://example.com/c.jpg')];
    },
  };
  const plantas = extraerPlantasDelDom(root);
  assert.deepEqual(plantas, [{ nombre: 'Con imagen', imagen: 'https://example.com/c.jpg' }]);
});
