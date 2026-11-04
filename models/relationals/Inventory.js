const { DataTypes } = require('sequelize');
const sequelize = require('../../config/sequelize');

// variant_id no se declara aqui, se inyecta cuando
// hacemos la asociacion en index.js
const Inventory = sequelize.define('Inventory', {
  stock:    { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  reserved: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
}, {
  tableName: 'inventories',
  timestamps: true,
  createdAt: false,            // en el diagrama solo viene el updated_at
  updatedAt: 'updated_at'      // este es el que pide el diagrama
});

module.exports = Inventory;