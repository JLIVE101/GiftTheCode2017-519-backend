module.exports = function(sequelize, DataTypes) {
    var Member = sequelize.define('Member', {
        memberId: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        streetAddress: {
            type: DataTypes.STRING(60),
            allowNull: false
        },
        city: {
            type: DataTypes.STRING(30),
            allowNull: false
        },
        province_state: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        country: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        phone_mobile: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        phone_home: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        phone_work: {
            type: DataTypes.STRING(10),
            allowNull: false
        }, 
        firstName: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        lastName: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(60),
            allowNull: false
        },
        membership_type: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        birthdate: {
            type: DataTypes.DATE,
            allowNull: false
        },
        inCatchment: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        household: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }, {
        timestamps: false,
        freezeTableName: true,
        tableName: 'member'
    });

    return Member;
}

