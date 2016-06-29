Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/trusty64"

  config.vm.provision :shell, :path => "scripts/bootstrap.sh"
  config.vm.network :forwarded_port, guest: 80, host: 5000, auto_correct: true
  config.vm.network :forwarded_port, guest: 443, host: 5443, auto_correct: true

  config.vm.synced_folder "./", "/data/www/rawgit.com",
    create: true, group: "www-data"
end
