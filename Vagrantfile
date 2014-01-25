Vagrant.configure("2") do |config|
  config.vm.box = "precise64"
  config.vm.box_url = "http://files.vagrantup.com/precise64.box"

  config.vm.provision :shell, :path => "scripts/bootstrap.sh"
  config.vm.network :forwarded_port, guest: 80, host: 5000, auto_correct: true

  config.vm.synced_folder "./", "/data/www/rawgithub.com",
    create: true, group: "www-data"
end
