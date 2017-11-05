module.exports = function(sequelize, DataTypes) {
    var Permission = sequelize.define('Permission', {
        permId: {
            type: DataTypes.INTEGER
        },
        permSolicit: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        permNewsletter: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    }, {
        timestamps: false,
        freezeTableName: true,
        tableName: 'permission'
    });

    Permission.removeAttribute('id');   

    return Permission;
};