from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import UserSerializer
from .models import MyUser as User
from django.core.mail import EmailMessage
from .tokens import make_code

# Create your views here.
@api_view(['POST'])
def nickname_check(request):
    nickname = request.GET.get('nickname')
    # print(nickname)
    if User.objects.filter(nickname=nickname).exists():
        # print(nickname)
        return Response({'fail'})
    
    return Response({'success'})

@api_view(['POST'])
def userid_check(request):
    email = request.data.get('email')
    # print(email)

    if User.objects.filter(email=email).exists():
        return Response({'fail'})
    
    return Response({'success'})

@api_view(['POST'])
def signup(request):
    password = request.data.get('password')
    password_confirmation = request.data.get('passwordConfirmation')
    
    if password != password_confirmation:
        return Response({'error': '비밀번호가 일치하지 않습니다.'},status=status.HTTP_400_BAD_REQUEST)
    
    serializer = UserSerializer(data=request.data)
    
    if serializer.is_valid(raise_exception=True):
        user = serializer.save()
        # user.is_active = True
        user.set_password(request.data.get('password'))
        token = make_code()
        user.token = token
        user.save()
        print(token)
        message = f'이메일 인증을 위해서 {token} 을 입력해주세요'
        mail_title = '오토토 이메일 인증'
        mail_to = request.data.get('email')
        email = EmailMessage(mail_title,message,to=[mail_to])
        email.send()
        print(type(serializer.data))
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['POST'])
def email_check(request):
    token = request.data.get('token')
    user = User.objects.get(email=request.data.get('email'))
    if user.token == token:
        user.is_active = True
        user.save()
        return Response({'success'})
    return Response({'fail'})

@api_view(['POST'])
def user_delete(request):
    email = request.data.get('email')
    print(email)
    if User.objects.filter(email=email).exists():
        User.delete(User.objects.get(email=email))
        return Response({'success'})
    
    return Response({'fail'})

@api_view(['POST'])
def user_update(request):
    email = request.data.get('email')
    nickname = request.data.get('nickname')
    # password = request.data.get('password')
    user = User.objects.get(email=email)
    user.nickname = nickname
    user.save()
    return Response({'success'})