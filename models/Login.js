module.exports = function(sequelize, DataTypes) {
    var Login = sequelize.define('Login', {
        dbIndex: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING(60),
            allowNull: false
        },
        resetHash: {
            type: DataTypes.UUID,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4
        },
        lastLogin: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: new Date()
        }
    }, {
        timestamps: false,
        freezeTableName: true,
        tableName: 'login'
    });

    Login.removeAttribute('id');    

    return Login;
};