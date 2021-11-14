#!/usr/bin/perl
# Send miner infos to monitor system
# Corporation: Versates INC
# Author: Inacio Klassmann
# Usage: ./vminer-agent.test.sh

use strict;
use warnings;

my $logFile = "/tmp/vminer-agent.log";
my $QUEUE_URL = "http://localhost:15672/api/exchanges/%2f/amq.default/publish";
my ($HOST) = $QUEUE_URL =~ /\/\/([^:]*)/g;
my $SHUTDOWN_REPORT_URL = "http://$HOST:8100/agent/IP/shutdown-report";


sub trim { 
    my $s = shift; 
    $s =~ s/^\s+|\s+$//g; 
    return $s 
}

sub convert_pools_to_json {
    my ($command) = @_;
    my $output=`$command | egrep -o "'(.*)'" | sed -e "s/'//g"`;
    my @array = split /[|]/, $output;
    my @json = ();
    shift @array;
    pop @array;
    
    for my $element (@array) {
        my @pool = ();
        my @lines = split /,/, $element;
        for my $map (@lines) {
            my ($key, $value) = split /=/, $map;
            if ($key eq 'User') {
                push @pool, '"' . $key . '": "' . int(rand(2)) . '"';
            } else {
                push @pool, '"' . $key . '": "' . $value . '"';
            }
        }
        my $str = join ',', @pool;
        push @json, '{' . $str . '}'
    }
    my $str = join ',', @json;
    return '[' . $str . ']';
}

sub convert_to_json {
    my ($command) = @_;
    my $output=`$command | egrep -o "'(.*)'" | sed -e "s/'//g"`;
    my @array = split /[|]/, $output;
    my @json = ();

    push @json, '"date": "' . trim(`date '+%Y%m%d%H%M%S'`) . '"';
    
    for my $element (@array) {
        my @lines = split /,/, $element;
        pop @lines;
        for my $map (@lines) {
            my ($key, $value) = split /=/, $map;
            if (!$value) {
                $value = '';
            }
            if ($key eq 'temp2_6' || $key eq 'temp2_7' || $key eq 'temp2_8') {
                push @json, '"' . $key . '": "' . int(rand(100)) . '"';
            } else {
                push @json, '"' . $key . '": "' . $value . '"';
            }
        }
    }
    my $str = join ',', @json;
    return '{' . $str . '}';
}

sub get_ip {
    return int(rand(1000));
}

sub get_network {
    my $ip = get_ip();
    my $macaddress = int(rand(1000));

    return '{"ip": "'.$ip.'", "macaddress": "'.$macaddress.'"}';
}

sub check_temperature_to_shutdown {
    my ($stats) = @_;
    my ($temp1) = $stats =~ /"temp2_6": "(\d+)",/g;
    my ($temp2) = $stats =~ /"temp2_7": "(\d+)",/g;
    my ($temp3) = $stats =~ /"temp2_8": "(\d+)",/g;
    my $max = 84;

    if ($temp1 >= $max || $temp2 >= $max || $temp3 >= $max) {
        my $date = trim(`date '+%Y-%m-%d %H:%M:%S'`);
        `echo "[$date] Shutting down because temperature is to hight! ($temp1, $temp2, $temp3)" >> $logFile`;
        my $ip = get_ip();
        my $url = $SHUTDOWN_REPORT_URL =~ s/IP/$ip/r;
        print `curl -i -H "content-type:plain/text" -X GET $url`;
        return 1;
    }
    return 0;
}


while (1) {
    my $result = trim(`./bmminer-api stats`);
    # wait til bmminer software is running
    if (index($result, "failed") == -1) {
        my $stats = convert_to_json('./bmminer-api stats');
        my $summary = convert_to_json('./bmminer-api summary');
        my $pools = convert_pools_to_json('./bmminer-api pools');
        my $network = get_network;

        if (check_temperature_to_shutdown($stats)) {
            # print `shutdown -hP now`;
        } else {
            # json infos content
            my $json='{"network": '.$network.', "summary":'.$summary.', "stats":'.$stats.', "pools":'.$pools.'}';
            print "$json\n";
            # escape char "
            $json =~ s/"/\\"/g;
            # full json to send to queue
            $json='{"payload": "'.$json.'", "vhost": "/", "name": "amq.default","properties": {"delivery_mode": 1, "headers": {}}, "routing_key": "dashboard-monitor", "delivery_mode": 1, "headers": {}, "props": {}, "payload_encoding": "string"}';
            print `curl -i -u guest:guest -H "content-type:plain/text" -X POST $QUEUE_URL -d '$json'`;
        }
    }
}
