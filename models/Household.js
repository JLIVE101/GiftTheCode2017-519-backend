module.exports = function(sequelize, DataTypes) {  
    var Household = sequelize.define('Household', {
        relationship_id: {
            type: DataTypes.INTEGER
        },
        relationship_type: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        firstName: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        lastName: {
            type: DataTypes.STRING(50),
            allowNull: false
        }
    }, {
        timestamps: false,
        freezeTableName: true,
        tableName: 'household'
    });

    return Household;
};