module.exports = function(sequelize, DataTypes) {
    var Testimony = sequelize.define('Testimony', {
        memberId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        testimony: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        timestamps: false,
        freezeTableName: true,
        tableName: 'testimony'
    });

    Testimony.removeAttribute('id');        

    return Testimony;
};