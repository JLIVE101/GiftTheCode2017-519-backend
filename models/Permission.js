module.exports = function(sequelize, DataTypes) {
    var Permission = sequelize.define('Permission', {
        perm_id: {
            // model: Member,
            // key: 'memberId',
            type: DataTypes.INTEGER
        },
        perm_email: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        perm_mail: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        perm_phone: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        perm_solicit: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        perm_newsletter: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    }, {
        timestamps: false,
        freezeTableName: true,
        tableName: 'permission'
    });

    return Permission;
};