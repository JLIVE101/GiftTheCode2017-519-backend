module.exports = function(sequelize, DataTypes) {
    var Member = sequelize.define('Member', {
        dbIndex: {
            type: DataTypes.INTEGER,
            primaryKey: true, 
            autoIncrement: true
        },
        memberCardNumber: {
            type: DataTypes.STRING,
            allowNull: true
        },
        memberId: {
            type: DataTypes.UUID,
            default: DataTypes.UUIDV4           
        },
        apartmentNumber: {
            type: DataTypes.STRING(10),
            allowNull: true
        },
        streetNumber: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        street: {
            type: DataTypes.STRING(50)
        },
        city: {
            type: DataTypes.STRING(30),
            allowNull: false
        },
        provinceState: {
            type: DataTypes.STRING(2),
            allowNull: false
        },
        country: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        postalCode: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        phone: {
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
            allowNull: false,
            unique: true
        },
        membershipType: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        permSolicit: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            default: false
        },
        permNewsletter: {
            type: DataTypes.BOOLEAN,
            allowNull: fales,
            default: false
        },
        birthDate: {
            type: DataTypes.DATE,
            allowNull: true
        },
        inCatchment: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        dateCreated: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: new Date()
        },
        testimony: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        timestamps: false,
        freezeTableName: true,
        tableName: 'member'
    });

    Member.removeAttribute('id');        

    return Member;
}

