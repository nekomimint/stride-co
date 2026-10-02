const { DataTypes } = require('sequelize');
const sequelize = require('../../config/sequelize');

const Role = sequelize.define('Role', {
  name: { type: DataTypes.STRING(50), allowNull: false },
  description: { type: DataTypes.STRING(255), allowNull: true }
}, {
  tableName: 'roles',
  timestamps: false 
  // Según el diagrama, Role no requiere timestamps creo
});

module.exports = Role;
