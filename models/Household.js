module.exports = function(sequelize, DataTypes) {  
    var Household = sequelize.define('Household', {
        relationshipId: {
            type: DataTypes.INTEGER
        },
        relationshipType: {
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