const { DataTypes } = require('sequelize');
const sequelize = require('../../config/sequelize');

// product_id no se declara aqui se inyecta cuando
// hacemos la asociacion en index.js
const ProductVariant = sequelize.define('ProductVariant', {
  sku:    { type: DataTypes.STRING(100), allowNull: false, unique: true },
  size:   { type: DataTypes.STRING(20),  allowNull: true },
  color:  { type: DataTypes.STRING(30),  allowNull: true },
  active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'product_variants',
  timestamps: false
});

module.exports = ProductVariant;