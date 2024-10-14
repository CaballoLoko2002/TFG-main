# import necessary packages
 
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib

import os

 
def enviarCorreoRegistro(destinatario, code): 
    msg = MIMEMultipart()
    message = f"<html><head><title>New User</title></head><body><h1>Welcome to Cultural Challenge for English Students</h1><br>Your code is <em>{code}</em>.<br>Thank you.</body></html>"

    msg['From'] = os.getenv('SMTP_USER', 'cchasetfg@gmail.com')  # Cambia por tu correo
    msg['To'] = destinatario
    msg['Subject'] = "New Player CChase"
    msg.attach(MIMEText(message, 'html'))

    # Usar Gmail como servidor SMTP
    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()

    # Obtener credenciales desde variables de entorno
    smtp_user = os.getenv('SMTP_USER', 'cchasetfg@gmail.com')
    smtp_password = os.getenv('SMTP_PASSWORD', 'tu_contraseña_de_aplicación')

    # Autenticarse en el servidor
    server.login(smtp_user, smtp_password)

    # Enviar el mensaje
    server.sendmail(msg['From'], msg['To'], msg.as_string())
    server.quit()

    print("Correo enviado con éxito a %s" % (msg['To']))


def enviarCorreoPassword(destinatario, code): 
    # create message object instance
    msg = MIMEMultipart()
 
 
    message = f"<html><head><title>Change Password</title></head><body><h1>Nice to see you again</h1><br>Your code for change the password is <em>{code}</em>.<br>Thank you, Cultural Challenge for English Students.</body></html>"
 
    password = "YmEuQj49"
    msg['From'] = "CChase@um.es"
    msg['To'] = destinatario
    msg['Subject'] = "New Password CChase"
    
    # add in the message body
    msg.attach(MIMEText(message, 'html'))
    
    #create server
    server = smtplib.SMTP('smtp.um.es: 587')
    
    server.starttls()
    
    # Login Credentials for sending the mail
    server.login("guillermo.nunezc@um.es", password)
    

    # send the message via the server.
    server.sendmail(msg['From'], msg['To'], msg.as_string())
    server.quit()
 
    print("successfully sent email to %s:" % (msg['To']))
    return

def enviarCorreoLogroToProfesor(correo, mensaje,p):
    # create message object instance
    msg = MIMEMultipart()
 
 
    message = f"<html><head><title>New Achievement</title></head><body><h1>Nice to see you again</h1><br>Your student <em>{correo}</em> has won the achievement <em>{mensaje}</em>.<br>Congratulations, Cultural Challenge for English Students.</body></html>"
 
    password = "YmEuQj49"
    msg['From'] = "CChase@um.es"
    msg['To'] = p
    msg['Subject'] = "New Achievement"
    
    # add in the message body
    msg.attach(MIMEText(message, 'html'))
    
    #create server
    server = smtplib.SMTP('smtp.um.es: 587')
    
    server.starttls()
    
    # Login Credentials for sending the mail
    server.login("guillermo.nunezc@um.es", password)
    

    # send the message via the server.
    server.sendmail(msg['From'], msg['To'], msg.as_string())
    server.quit()
 
    print("successfully sent email to %s:" % (msg['To']))
    return

def enviarCorreoLogroToAlumno(mail,mensaje):
    # create message object instance
    msg = MIMEMultipart()
 

    message = f"<html><head><title>New Achievement</title></head><body><h1>Nice to see you again</h1><br>You has won the achievement <em>{mensaje}</em>.<br>Congratulations, Cultural Challenge for English Students.</body></html>"
 
    password = "YmEuQj49"
    msg['From'] = "CChase@um.es"
    msg['To'] = mail
    msg['Subject'] = "New Achievement"
    
    # add in the message body
    msg.attach(MIMEText(message, 'html'))
    
    #create server
    server = smtplib.SMTP('smtp.um.es: 587')
    
    server.starttls()
    
    # Login Credentials for sending the mail
    server.login("guillermo.nunezc@um.es", password)
    

    # send the message via the server.
    server.sendmail(msg['From'], msg['To'], msg.as_string())
    server.quit()
 
    print("successfully sent email to %s:" % (msg['To']))
    return