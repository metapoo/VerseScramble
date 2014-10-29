from fabric.api import run

def host_type():
    run('uname -s')

def deploy():
    run('cd ~/python/verserain; git pull;')
    run('python ~/python/verserain/bin/minify_css.py')
