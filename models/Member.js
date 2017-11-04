var Member = sequelize.define('member', {
    memberId: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    streetAddress: {
        type: Sequelize.STRING(60),
        allowNull: false
    },
    city: {
        type: Sequelize.STRING(30),
        allowNull: false
    },
    province_state: {
        type: Sequelize.STRING(20),
        allowNull: false
    },
    country: {
        type: Sequelize.STRING(50),
        allowNull: false
    },
    phone_mobile: {
        type: Sequelize.STRING(10),
        allowNull: false
    },
    phone_home: {
        type: Sequelize.STRING(10),
        allowNull: false
    },
    phone_work: {
        type: Sequelize.STRING(10),
        allowNull: false
    }, 
    firstName: {
        type: Sequelize.STRING(10),
        allowNull: false
    },
    lastName: {
        type: Sequelize.STRING(10),
        allowNull: false
    },
    email: {
        type: Sequelize.STRING(60),
        allowNull: false
    },
    membership_type: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    birthdate: {
        type: Sequelize.DATE,
        allowNull: false
    },
    inCatchment: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    timestamps: false
});