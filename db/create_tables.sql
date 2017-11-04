CREATE TABLE member (
	memberId INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	streetAddress VARCHAR(60) NOT NULL,
	city VARCHAR(30) NOT NULL,
	province_state VARCHAR(20) NOT NULL,
	country VARCHAR(50) NOT NULL,
	phone_mobile VARCHAR(10) NOT NULL,
	phone_home VARCHAR(10) NOT NULL,
	phone_work VARCHAR(10) NOT NULL,
	firstName VARCHAR(50) NOT NULL,
	lastName VARCHAR(50) NOT NULL,
	email VARCHAR(60) NOT NULL,
	membership_type INT NOT NULL,
	birthdate DATE NOT NULL,
	inCatchment TINYINT(1) NOT NULL DEFAULT 0,
	household TINYINT(1) NOT NULL DEFAULT 0
);

CREATE TABLE login (
	memberId INT NOT NULL,
	password CHAR(60) BINARY NOT NULL,
	FOREIGN KEY (memberId) 
		REFERENCES member (memberId)
		ON DELETE CASCADE;
);

CREATE TABLE permission (
	perm_id INT NOT NULL,
	perm_email TINYINT(1) NOT NULL,
	perm_mail TINYINT(1) NOT NULL,
	perm_phone TINYINT(1) NOT NULL,
	perm_solicit TINYINT(1) NOT NULL,
	perm_newsletter TINYINT(1) NOT NULL,
	FOREIGN KEY (perm_id)
			REFERENCES member (memberId)
			ON DELETE CASCADE
);

CREATE TABLE household (
	relationship_id INT NOT NULL,
	relationship_type INT NOT NULL,
	firstName VARCHAR(50) NOT NULL,
	lastName VARCHAR(50) NOT NULL,
	FOREIGN KEY (relationship_id)
			REFERENCES member (memberId)
			ON DELETE CASCADE
);

CREATE TABLE status (
	memberId INT NOT NULL,
	active TINYINT(1) NOT NULL DEFAULT 0,
	hash CHAR(36),
	lastLogin DATETIME DEFAULT NOW(),
	FOREIGN KEY (memberId) REFERENCES member(memberId) ON DELETE CASCADE
);

CREATE TRIGGER beforeInsertStatus
	BEFORE INSERT ON status
	FOR EACH ROW
	SET new.hash = uuid();