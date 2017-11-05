module.exports = function(sequelize, DataTypes) {
    var MemberPreference = sequelize.define('MemberPreference', {
        memberId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        categoryId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        isPreferred: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }, {
        timestamps: false,
        freezeTableName: true,
        tableName: 'memberpreference'
    });

    MemberPreference.removeAttribute('id');        

    return MemberPreference;
};