from flask import Flask, render_template, request, jsonify, redirect, url_for, make_response
import json
import werkzeug
from werkzeug.utils import secure_filename
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin, login_user, LoginManager, login_required,  current_user, logout_user
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import InputRequired, Length, ValidationError
from flask_bcrypt import Bcrypt

path ='static/json/products.json'
base='static/json/'

app = Flask(__name__, static_url_path='/static')
bcrypt = Bcrypt(app)

app.config['SQLALCHEMY_DATABASE_URI']= 'sqlite:///user.db'
app.config['SECRET_KEY'] = 'jusxfondia'
db= SQLAlchemy(app)

class User(db.Model,UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(20), nullable=False, unique=True)
    password = db.Column(db.String(80), nullable=False)

    def __repr__(self):
        return '<User %r>' % self.username
    def is_active(self):
        # Assume all users are active
        return True
    def get_id(self):
        return str(self.id)

with app.app_context():
    db.create_all()

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

class RegisterForm(FlaskForm):
    email = StringField(validators=[InputRequired(), Length(min=4, max=20)], render_kw = {"placeholder": "Username"})
    password = PasswordField(validators=[InputRequired(), Length(min=8, max=20)], render_kw = {"placeholder": "Password"})
    submit = SubmitField('Register')
    def validate_email(self, email):
        existing_user_email = User.query.filter_by(
            email=email.data).first()
        if existing_user_email:
            raise ValidationError(
                'That email already exists. Please choose a different one.')

class LoginForm(FlaskForm):
    email = StringField(validators=[InputRequired(), Length(min=4, max=20)], render_kw = {"placeholder": "Email"})
    password = PasswordField(validators=[InputRequired(), Length(min=8, max=20)], render_kw = {"placeholder": "Password"})
    submit = SubmitField('Login')


@app.route("/", methods=['GET', 'POST'])
def root():
    all = json.loads(open(base+"all.json").read())
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(all, f, ensure_ascii=False, indent=4)
    form = LoginForm()
    registration_form = RegisterForm()
    if form.validate_on_submit() :
        user = User.query.filter_by(email=form.email.data).first()
        if user:
            if bcrypt.check_password_hash(user.password, form.password.data):
                login_user(user)
                return redirect(url_for('home'))
    
    if registration_form.validate_on_submit():
        hashed_password = bcrypt.generate_password_hash(registration_form.password.data)
        new_user = User(email=registration_form.email.data, password=hashed_password)
        db.session.add(new_user)
        if new_user in db.session:
            print("User added to session.")
        else:
            print("User not added to session.")
        try:
            db.session.commit()
            print("User committed to database.")
            return redirect(url_for('root'))
        except Exception as e:
            print("Error committing user to database: ", e)

    return render_template("index.html", query=None, form=form, registration_form=registration_form, all_items=all["items"])


@app.route('/home', methods=['GET', 'POST'])
@login_required
def home():
    user_id = current_user.id
    all = json.loads(open(base+"all.json").read())
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(all, f, ensure_ascii=False, indent=4)
    email = current_user.email
    response = make_response(render_template('home.html', email=email, all_items=all["items"], user_id=user_id)) #response is used to delete cache of site after logout
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0'
    return response


@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('root'))


@app.route("/search")
def ssearchResult():    
    form = LoginForm()
    registration_form = RegisterForm()
    query = request.args.get('query')
    all_data = json.loads(open(base + "all.json").read())
    if query.lower() == "kurta":
        kurta = [item for item in all_data["items"] if item["fields"]["category"].lower() == "kurta"]
        search_data = {"items": kurta}
    elif query.lower() == "shirt":
        shirt = [item for item in all_data["items"] if item["fields"]["category"].lower() == "shirt"]
        search_data = {"items": shirt}
    elif query.lower() == "tshirt":
        tshirt = [item for item in all_data["items"] if item["fields"]["category"].lower() == "tshirt"]
        search_data = {"items": tshirt}
    elif query.lower() == "pant":
        pant = [item for item in all_data["items"] if item["fields"]["category"].lower() == "pant"]
        search_data = {"items": pant}
    else:
        search_data = {"items": []}
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(search_data, f, ensure_ascii=False, indent=4)

    return render_template("index.html", query=query, form=form, registration_form=registration_form)


@app.route("/home/query")
@login_required
def search():
    query = request.args.get('query')
    all_data = json.loads(open(base + "all.json").read())
    if query.lower() == "kurta":
        kurta = [item for item in all_data["items"] if item["fields"]["category"].lower() == "kurta"]
        search_data = {"items": kurta}
    elif query.lower() == "shirt":
        shirt = [item for item in all_data["items"] if item["fields"]["category"].lower() == "shirt"]
        search_data = {"items": shirt}
    elif query.lower() == "tshirt":
        tshirt = [item for item in all_data["items"] if item["fields"]["category"].lower() == "tshirt"]
        search_data = {"items": tshirt}
    elif query.lower() == "pant":
        pant = [item for item in all_data["items"] if item["fields"]["category"].lower() == "pant"]
        search_data = {"items": pant}
    else:
        search_data = {"items": []}
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(search_data, f, ensure_ascii=False, indent=4)
    return render_template("home.html", query=query)


if(__name__ == "__main__"):
    app.run(debug= True)